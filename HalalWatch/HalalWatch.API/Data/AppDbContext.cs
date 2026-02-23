using HalalWatch.API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace HalalWatch.Data
{

	public class AppDbContext : IdentityDbContext<ApplicationUser>
	{
		public AppDbContext(DbContextOptions<AppDbContext> options)
			 : base(options)
		{
		}

		public DbSet<MovieSafetyReport> MovieSafetyReports { get; set; }
		public DbSet<Playlist> Playlists { get; set; }
		public DbSet<PlaylistMovie> PlaylistMovies { get; set; }
		public DbSet<PlaylistLike> PlaylistLikes { get; set; }


		protected override void OnModelCreating(ModelBuilder builder)
		{
			base.OnModelCreating(builder);

			builder.Entity<Playlist>()
				.HasOne(p => p.User)
				.WithMany(u => u.Playlists)
				.HasForeignKey(p => p.UserId)
				.OnDelete(DeleteBehavior.Cascade);

			builder.Entity<PlaylistMovie>()
				.HasOne(pm => pm.Playlist)
				.WithMany(p => p.Movies)
				.HasForeignKey(pm => pm.PlaylistId)
				.OnDelete(DeleteBehavior.Cascade);

			builder.Entity<PlaylistMovie>()
				.HasIndex(pm => new { pm.PlaylistId, pm.TmdbId })
				.IsUnique();

			builder.Entity<PlaylistLike>()
				.HasOne(l => l.User)
				.WithMany(u => u.LikedPlaylists)
				.HasForeignKey(l => l.UserId)
				.OnDelete(DeleteBehavior.Cascade);

			builder.Entity<PlaylistLike>()
				.HasOne(l => l.Playlist)
				.WithMany(p => p.Likes)
				.HasForeignKey(l => l.PlaylistId)
				.OnDelete(DeleteBehavior.Restrict);

			builder.Entity<PlaylistLike>()
				.HasIndex(l => new { l.UserId, l.PlaylistId })
				.IsUnique();
		}



	}

}
