using HalalWatch.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class ReportsController : ControllerBase
{
	private readonly AppDbContext _context;

	public ReportsController(AppDbContext context)
	{
		_context = context;
	}

	[AllowAnonymous]
	[HttpGet("{movieName}")]
	public IActionResult GetByMovie(string movieName)
	{
		var report = _context.MovieSafetyReports
			 .Where(r => r.MovieName.ToLower() == movieName.ToLower())
			 .OrderByDescending(r => r.GeneratedAt)
			 .FirstOrDefault();

		if (report == null)
			return NotFound(new { message = "No report found for this movie." });

		var response = new MovieSafetyReportResponseDto
		{
			MovieName = report.MovieName,
			NuditySexScore = report.NuditySexScore,
			LgbtScore = report.LgbtScore,
			IslamArabBiasScore = report.IslamArabBiasScore,
			OverallScore = report.OverallScore,
			Verdict = report.Verdict,
			TotalComments = report.TotalComments,
			GeneratedAt = report.GeneratedAt
		};

		return Ok(response);
	}
}
