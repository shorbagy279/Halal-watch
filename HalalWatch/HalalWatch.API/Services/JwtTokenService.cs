using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class JwtTokenService
{
	private readonly IConfiguration _config;

	public JwtTokenService(IConfiguration config)
	{
		_config = config;
	}

	public string CreateToken(ApplicationUser user)
	{
		var jwt = _config.GetSection("Jwt");

		var claims = new List<Claim>
		  {
				new Claim(ClaimTypes.NameIdentifier, user.Id),
				new Claim(ClaimTypes.Email, user.Email!),
				new Claim(ClaimTypes.Name, user.UserName!) // ⭐ IMPORTANT
        };

		var key = new SymmetricSecurityKey(
			 Encoding.UTF8.GetBytes(jwt["Key"]!)
		);

		var creds = new SigningCredentials(
			 key,
			 SecurityAlgorithms.HmacSha256
		);

		var token = new JwtSecurityToken(
			 issuer: jwt["Issuer"],
			 audience: jwt["Audience"],
			 claims: claims,
			 expires: DateTime.UtcNow.AddMinutes(
				  double.Parse(jwt["DurationInMinutes"]!)
			 ),
			 signingCredentials: creds
		);

		return new JwtSecurityTokenHandler().WriteToken(token);
	}
}
