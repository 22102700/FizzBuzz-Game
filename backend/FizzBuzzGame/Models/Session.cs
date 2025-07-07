using System.Text.Json;
using System.Text.Json.Serialization;

namespace FizzBuzzGame.Models
{
    public class Session
    {
        public int Id { get; set; }
        public int GameId { get; set; }
        public int? UserId { get; set; } // Null for guest sessions
        public string? GuestName { get; set; } // For guest players
        public DateTime StartTime { get; set; }
        public DateTime? EndTime { get; set; }
        public int Score { get; set; }
        public string NumbersServed { get; set; } = string.Empty; // Store as JSON array
        [JsonIgnore]
        public Game? Game { get; set; }
        [JsonIgnore]
        public User? User { get; set; }
        public List<Answer> Answers { get; set; } = new();
    }
} 