using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
	private readonly UserManager<ApplicationUser> _userManager;
	private readonly SignInManager<ApplicationUser> _signInManager;
	private readonly JwtTokenService _jwt;

	public AuthController(
		UserManager<ApplicationUser> userManager,
		SignInManager<ApplicationUser> signInManager,
		JwtTokenService jwt)
	{
		_userManager = userManager;
		_signInManager = signInManager;
		_jwt = jwt;
	}

	[HttpPost("register")]
	public async Task<IActionResult> Register(RegisterDto dto)
	{
		var user = new ApplicationUser
		{
			UserName = dto.Email,
			Email = dto.Email
		};

		var result = await _userManager.CreateAsync(user, dto.Password);

		if (!result.Succeeded)
			return BadRequest(result.Errors);

		var token = _jwt.CreateToken(user);

		return Ok(new
		{
			message = "User registered",
			token
		});
	}

	[HttpPost("login")]
	public async Task<IActionResult> Login(LoginDto dto)
	{
		var user = await _userManager.FindByEmailAsync(dto.Email);

		if (user == null)
			return Unauthorized("Invalid credentials");

		var result = await _signInManager.CheckPasswordSignInAsync(
			user, dto.Password, false);

		if (!result.Succeeded)
			return Unauthorized("Invalid credentials");

		var token = _jwt.CreateToken(user);

		return Ok(new
		{
			message = "Login successful",
			token
		});
	}
}
