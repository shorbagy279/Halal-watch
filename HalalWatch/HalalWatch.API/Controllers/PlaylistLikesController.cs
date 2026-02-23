using HalalWatch.API.Services;
using HalalWatch.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/playlists")]
public class PlaylistLikesController : ControllerBase
{
	private readonly AppDbContext _context;
	private readonly ICurrentUserService _currentUser;

	public PlaylistLikesController(
		 AppDbContext context,
		 ICurrentUserService currentUser)
	{
		_context = context;
		_currentUser = currentUser;
	}

	[Authorize]
	[HttpPost("{playlistId}/like")]
	public async Task<IActionResult> ToggleLike(int playlistId)
	{
		var playlist = await _context.Playlists
			 .FirstOrDefaultAsync(p => p.Id == playlistId);

		if (playlist == null)
			return NotFound();

		var existingLike = await _context.PlaylistLikes
			 .FirstOrDefaultAsync(l =>
				  l.PlaylistId == playlistId &&
				  l.UserId == _currentUser.UserId);

		if (existingLike != null)
		{
			_context.PlaylistLikes.Remove(existingLike);
			await _context.SaveChangesAsync();

			return Ok(new
			{
				liked = false,
				likes = await _context.PlaylistLikes
					  .CountAsync(l => l.PlaylistId == playlistId)
			});
		}

		_context.PlaylistLikes.Add(new PlaylistLike
		{
			PlaylistId = playlistId,
			UserId = _currentUser.UserId!
		});

		await _context.SaveChangesAsync();

		return Ok(new
		{
			liked = true,
			likes = await _context.PlaylistLikes
				  .CountAsync(l => l.PlaylistId == playlistId)
		});
	}
}
