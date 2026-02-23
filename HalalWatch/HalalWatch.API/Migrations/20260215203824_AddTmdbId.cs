using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HalalWatch.API.Migrations
{
    /// <inheritdoc />
    public partial class AddTmdbId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "TmdbId",
                table: "MovieSafetyReports",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TmdbId",
                table: "MovieSafetyReports");
        }
    }
}
