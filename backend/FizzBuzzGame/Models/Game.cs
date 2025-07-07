namespace FizzBuzzGame.Models
{
    public class Game
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public int MinNumber { get; set; }
        public int MaxNumber { get; set; }
        public List<Rule> Rules { get; set; } = new();
    }
} 