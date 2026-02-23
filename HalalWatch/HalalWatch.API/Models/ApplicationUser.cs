using HalalWatch.API.Models;
using Microsoft.AspNetCore.Identity;

public class ApplicationUser : IdentityUser
{
	public ICollection<Playlist> Playlists { get; set; }
		= new List<Playlist>();
	public ICollection<PlaylistLike> LikedPlaylists { get; set; }
	= new List<PlaylistLike>();

}
