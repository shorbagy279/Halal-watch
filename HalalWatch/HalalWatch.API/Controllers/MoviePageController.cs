using HalalWatch.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/movie")]
public class MoviePageController : ControllerBase
{
	private readonly AppDbContext _context;
	private readonly MovieMetadataService _metadata;

	public MoviePageController(
		 AppDbContext context,
		 MovieMetadataService metadata)
	{
		_context = context;
		_metadata = metadata;
	}

	[HttpGet("{tmdbId:int}")]
	public async Task<IActionResult> GetMovie(int tmdbId)
	{
		var movie = await _metadata.GetMovieById(tmdbId);

		if (movie == null)
			return NotFound();

		var report = await _context.MovieSafetyReports
			 .OrderByDescending(r => r.GeneratedAt)
			 .FirstOrDefaultAsync(r => r.TmdbId == tmdbId);

		if (report == null)
		{
			return Ok(new
			{
				movie,
				hasReport = false
			});
		}

		return Ok(new
		{
			movie,
			hasReport = true,
			report = new
			{
				overallScore = report.OverallScore,
				nudityScore = report.NuditySexScore,
				lgbtScore = report.LgbtScore,
				biasScore = report.IslamArabBiasScore,
				verdict = report.Verdict,
				generatedAt = report.GeneratedAt
			}
		});
	}

	[HttpGet("report/{tmdbId:int}")]
	public async Task<IActionResult> GetReport(int tmdbId)
	{
		var report = await _context.MovieSafetyReports
			 .OrderByDescending(r => r.GeneratedAt)
			 .FirstOrDefaultAsync(r => r.TmdbId == tmdbId);

		if (report == null)
			return NotFound();

		return Ok(new
		{
			overallScore = report.OverallScore,
			nudityScore = report.NuditySexScore,
			lgbtScore = report.LgbtScore,
			biasScore = report.IslamArabBiasScore,
			verdict = report.Verdict,
			generatedAt = report.GeneratedAt
		});
	}
}
