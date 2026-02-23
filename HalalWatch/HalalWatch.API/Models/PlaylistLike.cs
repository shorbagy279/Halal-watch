using HalalWatch.API.Models;

public class PlaylistLike
{
	public int Id { get; set; }

	// User
	public string UserId { get; set; }
	public ApplicationUser User { get; set; }

	// Playlist
	public int PlaylistId { get; set; }
	public Playlist Playlist { get; set; }

	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
