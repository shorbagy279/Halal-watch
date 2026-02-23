public class PythonAnalysisResultDto
{
	public string MovieName { get; set; }

	public Dictionary<string, double> Scores { get; set; }

	public double OverallScore { get; set; }

	public string Verdict { get; set; }

	public int TotalComments { get; set; }
}
