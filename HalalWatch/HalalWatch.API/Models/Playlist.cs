using System.ComponentModel.DataAnnotations;

namespace HalalWatch.API.Models;

public class Playlist
{
	[Key]
	public int Id { get; set; }

	[Required]
	public string Name { get; set; }

	public string? Description { get; set; }

	public bool IsPublic { get; set; } = false;

	[Required]
	public string UserId { get; set; }
	public ApplicationUser User { get; set; }

	public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

	public ICollection<PlaylistMovie> Movies { get; set; }
		= new List<PlaylistMovie>();

	public ICollection<PlaylistLike> Likes { get; set; }
	= new List<PlaylistLike>();

}
