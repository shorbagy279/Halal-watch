using HalalWatch.API.Services;
using HalalWatch.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
	private readonly UserManager<ApplicationUser> _userManager;
	private readonly AppDbContext _context;
	private readonly ICurrentUserService _currentUser;

	public ProfileController(
		 UserManager<ApplicationUser> userManager,
		 AppDbContext context,
		 ICurrentUserService currentUser)
	{
		_userManager = userManager;
		_context = context;
		_currentUser = currentUser;
	}

	[Authorize]
	[HttpGet("me")]
	public async Task<IActionResult> GetMyProfile()
	{
		var user = await _userManager.FindByIdAsync(_currentUser.UserId!);
		if (user == null) return Unauthorized();

		return await BuildProfileResponse(user, true);
	}

	[AllowAnonymous]
	[HttpGet("{username}")]
	public async Task<IActionResult> GetProfile(string username)
	{
		var user = await _userManager.Users
			 .FirstOrDefaultAsync(u => u.UserName == username);

		if (user == null)
			return NotFound();

		return await BuildProfileResponse(user, false);
	}

	[AllowAnonymous]
	[HttpGet("{username}/playlists")]
	public async Task<IActionResult> GetUserPlaylists(string username)
	{
		var user = await _userManager.Users
			 .FirstOrDefaultAsync(u => u.UserName == username);

		if (user == null)
			return NotFound();

		var playlists = await _context.Playlists
			 .Where(p => p.UserId == user.Id && p.IsPublic)
			 .Select(p => new
			 {
				 p.Id,
				 p.Name,
				 p.Description,
				 movieCount = p.Movies.Count,
				 createdAt = p.CreatedAt
			 })
			 .ToListAsync();

		return Ok(playlists);
	}

	private async Task<IActionResult> BuildProfileResponse(
		 ApplicationUser user,
		 bool includePrivate)
	{
		var playlistsQuery = _context.Playlists
			 .Where(p => p.UserId == user.Id);

		if (!includePrivate)
			playlistsQuery = playlistsQuery.Where(p => p.IsPublic);

		var playlists = await playlistsQuery
			 .Select(p => new
			 {
				 p.Id,
				 p.Name,
				 p.Description,
				 p.IsPublic,
				 movieCount = p.Movies.Count
			 })
			 .ToListAsync();

		var totalAnalyzedMovies =
			 await _context.MovieSafetyReports.CountAsync();

		var avgScore =
			 await _context.MovieSafetyReports
				  .Select(r => (double?)r.OverallScore)
				  .AverageAsync() ?? 0;

		return Ok(new
		{
			username = user.UserName,
			email = includePrivate ? user.Email : null,
			stats = new
			{
				playlistsCount = playlists.Count,
				totalAnalyzedMovies,
				averageHalalScore = Math.Round(avgScore, 2)
			},
			playlists
		});
	}
}
