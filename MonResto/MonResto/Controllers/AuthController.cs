using Microsoft.AspNetCore.Mvc;
using MonResto.Models;
using MonResto.Services;

namespace MonResto.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username et password sont requis" });
            }

            var response = await _authService.AuthenticateAsync(request);

            if (response == null)
            {
                return Unauthorized(new { message = "Username ou password incorrect" });
            }

            return Ok(response);
        }

        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { message = "API fonctionne correctement" });
        }
    }
}