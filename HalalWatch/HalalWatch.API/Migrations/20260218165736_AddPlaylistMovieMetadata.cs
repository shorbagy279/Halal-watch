using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HalalWatch.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPlaylistMovieMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MovieTitle",
                table: "PlaylistMovies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PosterUrl",
                table: "PlaylistMovies",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MovieTitle",
                table: "PlaylistMovies");

            migrationBuilder.DropColumn(
                name: "PosterUrl",
                table: "PlaylistMovies");
        }
    }
}
