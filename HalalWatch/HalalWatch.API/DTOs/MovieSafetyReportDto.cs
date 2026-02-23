public class MovieSafetyReportResponseDto
{
	public string MovieName { get; set; }

	public double NuditySexScore { get; set; }
	public double LgbtScore { get; set; }
	public double IslamArabBiasScore { get; set; }

	public double OverallScore { get; set; }
	public string Verdict { get; set; }
	public int TotalComments { get; set; }
	public DateTime GeneratedAt { get; set; }
}
