using HalalWatch.API.Models;
using HalalWatch.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using System.Text.Json;

[ApiController]
[Route("api/[controller]")]
public class AnalyzeController : ControllerBase
{
	private readonly AppDbContext _context;

	public AnalyzeController(AppDbContext context)
	{
		_context = context;
	}

	[HttpPost("{tmdbId:int}/{movieTitle}")]
	public async Task<IActionResult> Analyze(int tmdbId, string movieTitle)
	{
		if (string.IsNullOrWhiteSpace(movieTitle))
			return BadRequest("Movie title required.");

		try
		{
			var process = new Process
			{
				StartInfo = new ProcessStartInfo
				{
					FileName = "/home/shorbgy/Downloads/GradProject/ThePythonPart/venv/bin/python3",
					Arguments = $"main.py \"{movieTitle}\"",
					RedirectStandardOutput = true,
					RedirectStandardError = true,
					UseShellExecute = false,
					CreateNoWindow = true,
					WorkingDirectory = "/home/shorbgy/Downloads/GradProject/ThePythonPart"
				}
			};

			process.Start();

			string output = await process.StandardOutput.ReadToEndAsync();
			string error = await process.StandardError.ReadToEndAsync();

			await process.WaitForExitAsync();

			Console.WriteLine("PYTHON OUTPUT:");
			Console.WriteLine(output);

			if (process.ExitCode != 0)
			{
				return StatusCode(500, new
				{
					message = "Python script failed",
					error
				});
			}

			int jsonStart = output.IndexOf('{');

			if (jsonStart == -1)
				return StatusCode(500, "No JSON returned from analyzer.");

			string jsonOnly = output.Substring(jsonStart);

			var options = new JsonSerializerOptions
			{
				PropertyNameCaseInsensitive = true
			};

			var result = JsonSerializer.Deserialize<PythonAnalysisResultDto>(
				 jsonOnly,
				 options
			);

			if (result == null)
				return StatusCode(500, "Invalid analyzer response.");

			var existingReport = await _context.MovieSafetyReports
				 .FirstOrDefaultAsync(r => r.MovieName == result.MovieName);

			if (existingReport == null)
			{
				existingReport = new MovieSafetyReport();
				_context.MovieSafetyReports.Add(existingReport);
			}

			existingReport.MovieName = result.MovieName;
			existingReport.TmdbId = tmdbId;
			existingReport.NuditySexScore =
				 result.Scores.GetValueOrDefault("Nudity/Sex");

			existingReport.LgbtScore =
				 result.Scores.GetValueOrDefault("LGBT");

			existingReport.IslamArabBiasScore =
				 result.Scores.GetValueOrDefault("Islam/Arab Bias");

			existingReport.OverallScore = result.OverallScore;
			existingReport.Verdict = result.Verdict;
			existingReport.TotalComments = result.TotalComments;
			existingReport.GeneratedAt = DateTime.UtcNow;

			await _context.SaveChangesAsync();

			return Ok(new
			{
				message = "Analysis completed successfully",
				movie = existingReport.MovieName,

				overallScore = existingReport.OverallScore,
				verdict = existingReport.Verdict,

				nuditySexScore = existingReport.NuditySexScore,
				lgbtScore = existingReport.LgbtScore,
				islamArabBiasScore = existingReport.IslamArabBiasScore,

				totalComments = existingReport.TotalComments,
				generatedAt = existingReport.GeneratedAt
			});

		}
		catch (Exception ex)
		{
			return StatusCode(500, new
			{
				message = "Analyze endpoint failed",
				error = ex.Message,
				//---------------
				inner = ex.InnerException?.Message
				//---------------
			});
		}
	}
}
