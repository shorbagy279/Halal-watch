using static MovieMetadataService;

public class TmdbSearchResponse
{
	public List<TmdbMovie> results { get; set; } = new();
}
