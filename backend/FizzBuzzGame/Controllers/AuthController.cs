using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FizzBuzzGame.Models;
using System.Security.Cryptography;
using System.Text;

namespace FizzBuzzGame.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly FizzBuzzContext _context;

        public AuthController(FizzBuzzContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new AuthResponse { Success = false, Message = "All fields are required" });
                }

                if (request.Password.Length < 6)
                {
                    return BadRequest(new AuthResponse { Success = false, Message = "Password must be at least 6 characters long" });
                }

                // Check if username or email already exists
                if (await _context.Users.AnyAsync(u => u.Username == request.Username))
                {
                    return BadRequest(new AuthResponse { Success = false, Message = "Username already exists" });
                }

                if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                {
                    return BadRequest(new AuthResponse { Success = false, Message = "Email already exists" });
                }

                // Hash password
                var passwordHash = HashPassword(request.Password);

                var user = new User
                {
                    Username = request.Username,
                    Email = request.Email,
                    PasswordHash = passwordHash,
                    CreatedAt = DateTime.UtcNow
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                var token = GenerateToken(user.Id, user.Username);

                return Ok(new AuthResponse
                {
                    Success = true,
                    Token = token,
                    Message = "Registration successful",
                    User = new UserDto
                    {
                        Id = user.Id,
                        Username = user.Username,
                        Email = user.Email
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new AuthResponse { Success = false, Message = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
                {
                    return BadRequest(new AuthResponse { Success = false, Message = "Username and password are required" });
                }

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == request.Username);

                if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
                {
                    return BadRequest(new AuthResponse { Success = false, Message = "Invalid username or password" });
                }

                var token = GenerateToken(user.Id, user.Username);

                return Ok(new AuthResponse
                {
                    Success = true,
                    Token = token,
                    Message = "Login successful",
                    User = new UserDto
                    {
                        Id = user.Id,
                        Username = user.Username,
                        Email = user.Email
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new AuthResponse { Success = false, Message = ex.Message });
            }
        }

        [HttpGet("profile")]
        public async Task<ActionResult<object>> GetProfile()
        {
            try
            {
                var authHeader = Request.Headers["Authorization"].FirstOrDefault();
                if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
                    return Unauthorized(new { message = "Missing or invalid token" });
                var token = authHeader.Substring("Bearer ".Length);
                var user = await GetUserFromToken(token);
                if (user == null)
                    return Unauthorized(new { message = "Invalid token" });

                // Get all sessions for this user
                var sessions = await _context.Sessions.Include(s => s.Game).Where(s => s.UserId == user.Id && s.EndTime.HasValue).ToListAsync();
                int totalWins = 0;
                int highestScore = 0;
                string? highestScoreGame = null;

                if (sessions.Count > 0)
                {
                    // Highest score and game
                    var topSession = sessions.OrderByDescending(s => s.Score).First();
                    highestScore = topSession.Score;
                    highestScoreGame = topSession.Game?.Name;

                    // Win = highest score in a game (among all users)
                    var gameIds = sessions.Select(s => s.GameId).Distinct();
                    foreach (var gameId in gameIds)
                    {
                        var maxScore = await _context.Sessions.Where(s => s.GameId == gameId && s.EndTime.HasValue).MaxAsync(s => s.Score);
                        var userMax = sessions.Where(s => s.GameId == gameId).Max(s => s.Score);
                        if (userMax == maxScore && maxScore > 0)
                            totalWins++;
                    }
                }

                return Ok(new
                {
                    username = user.Username,
                    email = user.Email,
                    totalWins,
                    highestScore,
                    highestScoreGame
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        private async Task<User?> GetUserFromToken(string token)
        {
            try
            {
                var tokenData = System.Text.Encoding.UTF8.GetString(Convert.FromBase64String(token));
                var parts = tokenData.Split(':');
                if (parts.Length >= 2 && int.TryParse(parts[0], out int userId))
                {
                    return await _context.Users.FindAsync(userId);
                }
            }
            catch
            {
                // Invalid token
            }
            return null;
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        private bool VerifyPassword(string password, string hash)
        {
            return HashPassword(password) == hash;
        }

        private string GenerateToken(int userId, string username)
        {
            // Simple token generation - in production, use JWT
            var tokenData = $"{userId}:{username}:{DateTime.UtcNow.Ticks}";
            return Convert.ToBase64String(Encoding.UTF8.GetBytes(tokenData));
        }
    }
} 