using MonResto.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MonResto.Data;
using MongoDB.Driver;

namespace MonResto.Services
{
    public class AuthService : IAuthService
    {
        private readonly IConfiguration _configuration;
        private readonly MongoDbContext _context;

        public AuthService(IConfiguration configuration, MongoDbContext context)
        {
            _configuration = configuration;
            _context = context;
        }

        public async Task<LoginResponse> AuthenticateAsync(LoginRequest request)
        {
            var filter = Builders<User>.Filter.And(
                Builders<User>.Filter.Eq(u => u.Username, request.Username),
                Builders<User>.Filter.Eq(u => u.Password, request.Password)
            );
            var user = await _context.Users.Find(filter).FirstOrDefaultAsync();

            if (user == null)
                return null;

            var token = GenerateJwtToken(user);

            return new LoginResponse
            {
                Token = token,
                Username = user.Username,
                Role = user.Role,
                FullName = user.FullName
            };
        }

        public async Task<User> GetUserByUsernameAsync(string username)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Username, username);
            return await _context.Users.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<User> GetUserByIdAsync(string id)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Id, id);
            return await _context.Users.Find(filter).FirstOrDefaultAsync();
        }

        public async Task<List<User>> GetUsersByRoleAsync(string role)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Role, role);
            return await _context.Users.Find(filter).ToListAsync();
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            return await _context.Users.Find(FilterDefinition<User>.Empty).ToListAsync();
        }

        public async Task<User> CreateUserAsync(User user)
        {
            await _context.Users.InsertOneAsync(user);
            return user;
        }

        public async Task<User> UpdateUserAsync(User user)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Id, user.Id);
            var existingUser = await _context.Users.Find(filter).FirstOrDefaultAsync();
            
            if (existingUser != null)
            {
                var update = Builders<User>.Update
                    .Set(u => u.Username, user.Username)
                    .Set(u => u.FullName, user.FullName);

                if (!string.IsNullOrEmpty(user.Password))
                {
                    update = update.Set(u => u.Password, user.Password);
                }

                await _context.Users.UpdateOneAsync(filter, update);
                return await GetUserByIdAsync(user.Id);
            }
            return null;
        }

        public async Task<bool> DeleteUserAsync(string id)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Id, id);
            var result = await _context.Users.DeleteOneAsync(filter);
            return result.DeletedCount > 0;
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = jwtSettings["SecretKey"];
            var issuer = jwtSettings["Issuer"];
            var audience = jwtSettings["Audience"];
            var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"]);

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role),
                new Claim("FullName", user.FullName)
            };

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.Now.AddMinutes(expirationMinutes),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
