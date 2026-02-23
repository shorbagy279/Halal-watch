using HalalWatch.API.Services;
using HalalWatch.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;
namespace HalalWatch.API
{
	public class Program
	{
		public static void Main(string[] args)
		{
			var builder = WebApplication.CreateBuilder(args);

			builder.Services.AddDbContext<AppDbContext>(options =>
				 options.UseSqlServer(
					  builder.Configuration.GetConnectionString("DefaultConnection")
				 )
			);

			builder.Services.AddIdentity<ApplicationUser, IdentityRole>()
				 .AddEntityFrameworkStores<AppDbContext>()
				 .AddDefaultTokenProviders();

			builder.Services.ConfigureApplicationCookie(options =>
			{
				options.Events.OnRedirectToLogin = context =>
				{
					context.Response.StatusCode = 401;
					return Task.CompletedTask;
				};

				options.Events.OnRedirectToAccessDenied = context =>
				{
					context.Response.StatusCode = 403;
					return Task.CompletedTask;
				};
			});

			builder.Services.AddHttpClient<MovieMetadataService>();
			builder.Services.AddScoped<JwtTokenService>();
			builder.Services.AddHttpContextAccessor();
			builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();

			builder.Services.AddCors(options =>
			{
				options.AddPolicy("AllowAll", policy =>
				{
					policy.AllowAnyOrigin()
							.AllowAnyMethod()
							.AllowAnyHeader();
				});
			});

			builder.Services.AddControllers();

			var jwtSettings = builder.Configuration.GetSection("Jwt");
			var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]!);

			builder.Services.AddAuthentication(options =>
			{
				options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
				options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
			})
			.AddJwtBearer(options =>
			{
				options.TokenValidationParameters = new TokenValidationParameters
				{
					ValidateIssuer = true,
					ValidateAudience = true,
					ValidateLifetime = true,
					ValidateIssuerSigningKey = true,

					ValidIssuer = jwtSettings["Issuer"],
					ValidAudience = jwtSettings["Audience"],
					IssuerSigningKey = new SymmetricSecurityKey(key),

					ClockSkew = TimeSpan.Zero // removes default 5 min tolerance
				};
			});

			builder.Services.AddAuthorization();

			builder.Services.AddEndpointsApiExplorer();
			//----------------------------------------
			builder.Services.AddSwaggerGen(options =>
			{
				options.SwaggerDoc("v1", new OpenApiInfo
				{
					Title = "HalalWatch API",
					Version = "v1"
				});

				options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
				{
					Name = "Authorization",
					Type = SecuritySchemeType.Http,
					Scheme = "bearer",
					BearerFormat = "JWT",
					In = ParameterLocation.Header,
					Description = "Enter JWT token like: Bearer {your token}"
				});

				options.AddSecurityRequirement(new OpenApiSecurityRequirement
				 {
		  	  {
				new OpenApiSecurityScheme
				{
					 Reference = new OpenApiReference
					 {
						  Type = ReferenceType.SecurityScheme,
						  Id = "Bearer"
					 }
				},
				new string[] {}
			  }
			 });
			});
			//-------------------------------------

			var app = builder.Build();

			if (app.Environment.IsDevelopment())
			{
				app.UseSwagger();
				app.UseSwaggerUI();
			}

			app.UseHttpsRedirection();

			// TESTING ONLY
			app.UseCors("AllowAll");

			app.UseAuthentication();
			app.UseAuthorization();

			app.MapControllers();

			app.Run();
		}
	}
}
