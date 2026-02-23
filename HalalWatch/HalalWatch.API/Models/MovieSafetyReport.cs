using System.ComponentModel.DataAnnotations;

namespace HalalWatch.API.Models;
public class MovieSafetyReport
{
	[Key]
	public int Id { get; set; }

	public int? TmdbId { get; set; }
	[Required]
	public string MovieName { get; set; }

	public double NuditySexScore { get; set; }
	public double LgbtScore { get; set; }
	public double IslamArabBiasScore { get; set; }

	public double OverallScore { get; set; }
	public string Verdict { get; set; }

	public int TotalComments { get; set; }

	public DateTime GeneratedAt { get; set; }

	//public string? ScoresJson { get; set; }
}
