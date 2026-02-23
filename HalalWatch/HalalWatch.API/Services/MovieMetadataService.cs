using System.Text.Json;

public class MovieMetadataService
{
	private readonly HttpClient _http;
	private readonly IConfiguration _config;

	public MovieMetadataService(HttpClient http, IConfiguration config)
	{
		_http = http;
		_config = config;
	}

	public async Task<(string poster, string year)> GetTmdbData(string movieName)
	{
		var key = _config["ExternalApis:TmdbApiKey"];

		var searchUrl =
			 $"https://api.themoviedb.org/3/search/movie?api_key={key}&query={movieName}";

		var response = await _http.GetStringAsync(searchUrl);
		var json = JsonDocument.Parse(response);

		var result = json.RootElement
			 .GetProperty("results")
			 .EnumerateArray()
			 .FirstOrDefault();

		if (result.ValueKind == JsonValueKind.Undefined)
			return ("", "");

		var posterPath = result.GetProperty("poster_path").GetString();
		var year = result.GetProperty("release_date").GetString()?.Split('-')[0];

		var posterUrl = posterPath != null
			 ? $"https://image.tmdb.org/t/p/w500{posterPath}"
			 : "";

		return (posterUrl, year);
	}


	public async Task<string> GetMpaRating(string movieName)
	{
		var key = _config["ExternalApis:OmdbApiKey"];

		var url =
			 $"https://www.omdbapi.com/?apikey={key}&t={movieName}";

		var response = await _http.GetStringAsync(url);
		var json = JsonDocument.Parse(response);

		if (json.RootElement.TryGetProperty("Rated", out var rated))
			return rated.GetString() ?? "N/A";

		return "N/A";
	}
	public async Task<List<object>> SearchMovies(string query)
	{
		var key = _config["ExternalApis:TmdbApiKey"];

		var url =
			 $"https://api.themoviedb.org/3/search/multi?api_key={key}&query={Uri.EscapeDataString(query)}";

		var response =
			 await _http.GetFromJsonAsync<TmdbSearchResponse>(url);

		if (response?.results == null)
			return new List<object>();

		var normalizedQuery = query.ToLower();

		return response.results

			 .Where(r => r.media_type == "movie")

			 .Where(r =>
				  r.vote_count > 50 &&          
				  r.popularity > 5 &&           
				  r.poster_path != null)        

			 // ✅ smart ordering
			 .OrderByDescending(r =>
				  (r.title ?? r.name)
						.ToLower()
						.StartsWith(normalizedQuery)) 
			 .ThenByDescending(r => r.popularity)
			 .ThenByDescending(r => r.vote_count)

			 .Take(10)

			 .Select(m => new
			 {
				 id = m.id,
				 title = m.title ?? m.name,
				 year = (m.release_date ?? m.first_air_date)?
								  .Split('-')
								  .FirstOrDefault(),
				 poster = $"https://image.tmdb.org/t/p/w500{m.poster_path}"
			 })
			 .Cast<object>()
			 .ToList();
	}

	//--------------------------------------
	public async Task<object?> GetMovieById(int tmdbId)
	{
		var key = _config["ExternalApis:TmdbApiKey"];
		var url = $"https://api.themoviedb.org/3/movie/{tmdbId}?api_key={key}";

		try
		{
			var response = await _http.GetAsync(url);
			if (!response.IsSuccessStatusCode) return null;

			var json = await response.Content.ReadAsStringAsync();
			using var doc = JsonDocument.Parse(json);
			var root = doc.RootElement;

			return new
			{
				id = root.GetProperty("id").GetInt32(),
				title = root.GetProperty("title").GetString(),
				overview = root.GetProperty("overview").GetString(),
				year = root.GetProperty("release_date").GetString()?.Split('-')[0],
				poster = $"https://image.tmdb.org/t/p/w500{root.GetProperty("poster_path").GetString()}"
			};
		}
		catch
		{
			return null;
		}
	}
	//---------------------------------------

}
