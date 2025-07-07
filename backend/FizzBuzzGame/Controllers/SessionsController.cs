using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FizzBuzzGame.Models;
using System.Text.Json;

namespace FizzBuzzGame.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SessionsController : ControllerBase
    {
        private readonly FizzBuzzContext _context;
        private readonly Random _random = new();
        public SessionsController(FizzBuzzContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<object>> StartSession([FromBody] StartSessionRequest request)
        {
            var game = await _context.Games.Include(g => g.Rules).FirstOrDefaultAsync(g => g.Id == request.GameId);
            if (game == null) return NotFound();
            
            var session = new Session
            {
                GameId = request.GameId,
                StartTime = DateTime.UtcNow,
                Score = 0,
                NumbersServed = JsonSerializer.Serialize(new List<int>())
            };

            // Handle user authentication
            if (!string.IsNullOrEmpty(request.Token))
            {
                var user = await GetUserFromToken(request.Token);
                if (user != null)
                {
                    session.UserId = user.Id;
                }
            }
            else if (!string.IsNullOrEmpty(request.GuestName))
            {
                session.GuestName = request.GuestName;
            }

            _context.Sessions.Add(session);
            await _context.SaveChangesAsync();

            // Only pick numbers that match at least one rule
            var validNumbers = Enumerable.Range(game.MinNumber, game.MaxNumber - game.MinNumber + 1)
                .Where(n => game.Rules.Any(r => n % r.Divisor == 0)).ToList();
            if (validNumbers.Count == 0)
                return BadRequest(new { message = "No valid numbers for the given rules." });
            var random = new Random();
            int firstNumber = validNumbers[random.Next(validNumbers.Count)];
            var numbersServed = new List<int> { firstNumber };
            session.NumbersServed = JsonSerializer.Serialize(numbersServed);
            await _context.SaveChangesAsync();

            return new { sessionId = session.Id, firstNumber, game };
        }

        [HttpPost("{sessionId}/answer")]
        public async Task<ActionResult<object>> SubmitAnswer(int sessionId, [FromBody] Answer answer)
        {
            var session = await _context.Sessions.Include(s => s.Game).ThenInclude(g => g.Rules).Include(s => s.Answers).FirstOrDefaultAsync(s => s.Id == sessionId);
            if (session == null) return NotFound();
            var numbersServed = JsonSerializer.Deserialize<List<int>>(session.NumbersServed) ?? new List<int>();
            // Check answer
            var correct = GetFizzBuzzAnswer(answer.Number, session.Game!);
            answer.IsCorrect = string.Equals(answer.UserInput, correct, StringComparison.OrdinalIgnoreCase);
            answer.SessionId = sessionId;
            _context.Answers.Add(answer);
            if (answer.IsCorrect) session.Score++;
            // Only pick numbers that match at least one rule and haven't been served
            var validNumbers = Enumerable.Range(session.Game!.MinNumber, session.Game.MaxNumber - session.Game.MinNumber + 1)
                .Where(n => session.Game.Rules.Any(r => n % r.Divisor == 0) && !numbersServed.Contains(n)).ToList();
            int next = 0;
            if (validNumbers.Count > 0)
            {
                next = validNumbers[_random.Next(validNumbers.Count)];
                numbersServed.Add(next);
                session.NumbersServed = JsonSerializer.Serialize(numbersServed);
            }
            await _context.SaveChangesAsync();
            return new { correct = answer.IsCorrect, nextNumber = next };
        }

        [HttpGet("{sessionId}/score")]
        public async Task<ActionResult<object>> GetScore(int sessionId)
        {
            var session = await _context.Sessions.Include(s => s.Answers).FirstOrDefaultAsync(s => s.Id == sessionId);
            if (session == null) return NotFound();
            return new { correct = session.Answers.Count(a => a.IsCorrect), incorrect = session.Answers.Count(a => !a.IsCorrect) };
        }

        [HttpPost("{sessionId}/end")]
        public async Task<ActionResult<object>> EndSession(int sessionId)
        {
            var session = await _context.Sessions.FindAsync(sessionId);
            if (session == null) return NotFound();
            
            session.EndTime = DateTime.UtcNow;
            await _context.SaveChangesAsync();
            
            return new { success = true, finalScore = session.Score };
        }

        [HttpGet("leaderboard")]
        public async Task<ActionResult<List<LeaderboardEntry>>> GetLeaderboard()
        {
            var sessions = await _context.Sessions
                .Include(s => s.User)
                .Where(s => s.EndTime.HasValue && s.Score > 0)
                .OrderByDescending(s => s.Score)
                .Take(50)
                .ToListAsync();

            var leaderboard = sessions.Select(s => new LeaderboardEntry
            {
                Name = s.User != null ? s.User.Username : s.GuestName ?? "Anonymous",
                Score = s.Score,
                IsGuest = s.User == null
            }).ToList();

            return leaderboard;
        }

        private string GetFizzBuzzAnswer(int number, Game game)
        {
            var result = "";
            foreach (var rule in game.Rules.OrderBy(r => r.Divisor))
            {
                if (number % rule.Divisor == 0)
                    result += rule.Word;
            }
            return string.IsNullOrEmpty(result) ? number.ToString() : result;
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
    }
} 