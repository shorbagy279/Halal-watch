using HalalWatch.API.Models;
using HalalWatch.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class HomeController : ControllerBase
{
	private readonly AppDbContext _context;
	private readonly MovieMetadataService _metadata;

	public HomeController(
		 AppDbContext context,
		 MovieMetadataService metadata)
	{
		_context = context;
		_metadata = metadata;
	}
	private async Task<object> BuildMovieCard(MovieSafetyReport report)
	{
		var (poster, year) =
			 await _metadata.GetTmdbData(report.MovieName);

		var rating =
			 await _metadata.GetMpaRating(report.MovieName);

		return new
		{
			title = report.MovieName,
			poster,
			year,
			report.TmdbId,
			mpaRating = rating,
			overallScore = report.OverallScore,
			nudityScore = report.NuditySexScore,
			lgbtScore = report.LgbtScore,
			biasScore = report.IslamArabBiasScore
		};
	}
	[HttpGet]
	public async Task<IActionResult> GetHomepage()
	{
		var nudity = _context.MovieSafetyReports
			 .OrderByDescending(m => m.NuditySexScore)
			 .Take(5)
			 .ToList();

		var lgbt = _context.MovieSafetyReports
			 .OrderByDescending(m => m.LgbtScore)
			 .Take(5)
			 .ToList();

		var bias = _context.MovieSafetyReports
			 .OrderByDescending(m => m.IslamArabBiasScore)
			 .Take(5)
			 .ToList();

		var result = new
		{
			nudityFree = await Task.WhenAll(nudity.Select(BuildMovieCard)),
			lgbtFree = await Task.WhenAll(lgbt.Select(BuildMovieCard)),
			biasFree = await Task.WhenAll(bias.Select(BuildMovieCard))
		};

		return Ok(result);
	}

	[HttpGet("community-playlists")]
	public async Task<IActionResult> GetCommunityPlaylists()
	{
		var playlists = await _context.Playlists
			.Where(p => p.IsPublic)
			.OrderByDescending(p => p.Likes.Count)
		   .ThenByDescending(p => p.Movies.Count)
		   .ThenByDescending(p => p.CreatedAt)
			.Include(p => p.Likes)
			.Take(10)
			.Select(p => new
			{
				id = p.Id,
				name = p.Name,
				description = p.Description,

				creator = p.User.UserName,

				movieCount = p.Movies.Count,
				likes = p.Likes.Count,

				previewPosters = p.Movies
					.Take(4)
					.Select(m => m.PosterUrl)
					.ToList()
			})
			.ToListAsync();

		return Ok(playlists);
	}



}
