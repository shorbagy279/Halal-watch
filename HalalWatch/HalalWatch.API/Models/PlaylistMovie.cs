using HalalWatch.API.Models;

public class PlaylistMovie
{
	public int Id { get; set; }

	public int PlaylistId { get; set; }
	public Playlist Playlist { get; set; }

	public int TmdbId { get; set; }

	public string MovieTitle { get; set; }
	public string? PosterUrl { get; set; }

	public DateTime AddedAt { get; set; } = DateTime.UtcNow;
}
