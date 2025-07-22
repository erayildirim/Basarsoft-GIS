using Microsoft.EntityFrameworkCore.Migrations;
using NetTopologySuite.Geometries;

#nullable disable

namespace Basarsoft.Migrations
{
    /// <inheritdoc />
    public partial class SpatialSchemaUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PointX",
                table: "Points");

            migrationBuilder.DropColumn(
                name: "PointY",
                table: "Points");

            migrationBuilder.DropColumn(
                name: "Wkt",
                table: "Points");

            migrationBuilder.AddColumn<Point>(
                name: "Location",
                table: "Points",
                type: "geometry",
                nullable: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Location",
                table: "Points");

            migrationBuilder.AddColumn<double>(
                name: "PointX",
                table: "Points",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "PointY",
                table: "Points",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<string>(
                name: "Wkt",
                table: "Points",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
