using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class SearchController : ControllerBase
{
	private readonly MovieMetadataService _metadata;

	public SearchController(MovieMetadataService metadata)
	{
		_metadata = metadata;
	}

	[HttpGet]
	public async Task<IActionResult> Search(string query)
	{
		if (string.IsNullOrWhiteSpace(query))
			return BadRequest("Query required");

		var results = await _metadata.SearchMovies(query);

		return Ok(results);
	}
}
