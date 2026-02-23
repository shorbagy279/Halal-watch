using HalalWatch.API.Models;
using HalalWatch.API.Services;
using HalalWatch.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PlaylistsController : ControllerBase
{
	private readonly AppDbContext _context;
	private readonly ICurrentUserService _currentUser;

	public PlaylistsController(
		 AppDbContext context,
		 ICurrentUserService currentUser)
	{
		_context = context;
		_currentUser = currentUser;
	}

	[HttpPost]
	public async Task<IActionResult> CreatePlaylist(CreatePlaylistDto dto)
	{
		var playlist = new Playlist
		{
			Name = dto.Name,
			Description = dto.Description,
			IsPublic = dto.IsPublic,
			UserId = _currentUser.UserId!
		};

		_context.Playlists.Add(playlist);
		await _context.SaveChangesAsync();

		return Ok(new
		{
			message = "Playlist created",
			playlistId = playlist.Id
		});
	}

	[HttpGet("mine")]
	public async Task<IActionResult> GetMyPlaylists()
	{
		var playlists = await _context.Playlists
			 .Where(p => p.UserId == _currentUser.UserId)
			 .Select(p => new
			 {
				 p.Id,
				 p.Name,
				 p.Description,
				 p.IsPublic,
				 movieCount = p.Movies.Count
			 })
			 .ToListAsync();

		return Ok(playlists);
	}

	[HttpPost("{playlistId}/add")]
	public async Task<IActionResult> AddMovie(
		 int playlistId,
		 AddMovieToPlaylistDto dto)
	{
		var playlist = await _context.Playlists
			 .Include(p => p.Movies)
			 .FirstOrDefaultAsync(p =>
				  p.Id == playlistId &&
				  p.UserId == _currentUser.UserId);

		if (playlist == null)
			return NotFound("Playlist not found.");

		if (playlist.Movies.Any(m => m.TmdbId == dto.TmdbId))
			return BadRequest("Movie already exists.");

		var playlistMovie = new PlaylistMovie
		{
			PlaylistId = playlistId,
			TmdbId = dto.TmdbId,
			MovieTitle = dto.MovieTitle,
			PosterUrl = dto.PosterUrl
		};

		_context.PlaylistMovies.Add(playlistMovie);
		await _context.SaveChangesAsync();

		return Ok("Movie added.");
	}

	[HttpDelete("{playlistId}/remove/{tmdbId}")]
	public async Task<IActionResult> RemoveMovie(int playlistId, int tmdbId)
	{
		var playlist = await _context.Playlists
			 .FirstOrDefaultAsync(p =>
				  p.Id == playlistId &&
				  p.UserId == _currentUser.UserId);

		if (playlist == null)
			return NotFound();

		var movie = await _context.PlaylistMovies
			 .FirstOrDefaultAsync(m =>
				  m.PlaylistId == playlistId &&
				  m.TmdbId == tmdbId);

		if (movie == null)
			return NotFound();

		_context.PlaylistMovies.Remove(movie);
		await _context.SaveChangesAsync();

		return Ok("Movie removed.");
	}

	[AllowAnonymous]
	[HttpGet("{playlistId}")]
	public async Task<IActionResult> GetPlaylist(int playlistId)
	{
		var playlist = await _context.Playlists
			 .Include(p => p.Movies)
			 .Include(p => p.User)
			 .FirstOrDefaultAsync(p => p.Id == playlistId);

		if (playlist == null)
			return NotFound();

		if (!playlist.IsPublic &&
			 playlist.UserId != _currentUser.UserId)
			return Forbid();

		return Ok(new
		{
			playlist.Id,
			playlist.Name,
			playlist.Description,
			playlist.IsPublic,
			owner = playlist.User.UserName,
			movies = playlist.Movies.Select(m => new
			{
				m.TmdbId,
				m.MovieTitle,
				m.PosterUrl,
				m.AddedAt
			})
		});
	}
}
