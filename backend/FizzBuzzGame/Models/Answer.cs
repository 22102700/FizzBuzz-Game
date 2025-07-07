using System.Text.Json.Serialization;

namespace FizzBuzzGame.Models
{
    public class Answer
    {
        public int Id { get; set; }
        public int SessionId { get; set; }
        public int Number { get; set; }
        public string UserInput { get; set; } = string.Empty;
        public bool IsCorrect { get; set; }
        [JsonIgnore]
        public Session? Session { get; set; }
    }
} 