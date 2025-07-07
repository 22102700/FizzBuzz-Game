using System.Text.Json.Serialization;

namespace FizzBuzzGame.Models
{
    public class Rule
    {
        public int Id { get; set; }
        public int GameId { get; set; }
        public int Divisor { get; set; }
        public string Word { get; set; } = string.Empty;
        [JsonIgnore]
        public Game? Game { get; set; }
    }
} 