using System.Security.Claims;

namespace HalalWatch.API.Services
{
	public class CurrentUserService : ICurrentUserService
	{
		private readonly IHttpContextAccessor _httpContextAccessor;

		public CurrentUserService(IHttpContextAccessor httpContextAccessor)
		{
			_httpContextAccessor = httpContextAccessor;
		}

		private ClaimsPrincipal? User =>
			 _httpContextAccessor.HttpContext?.User;

		public string? UserId =>
			 User?.FindFirstValue(ClaimTypes.NameIdentifier);

		public string? Email =>
			 User?.FindFirstValue(ClaimTypes.Email);

		public bool IsAuthenticated =>
			 User?.Identity?.IsAuthenticated ?? false;
	}
}
