namespace FizzBuzzGame.Models
{
    public class RegisterRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public bool Success { get; set; }
        public string Token { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public UserDto? User { get; set; }
    }

    public class UserDto
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }

    public class StartSessionRequest
    {
        public int GameId { get; set; }
        public string? Token { get; set; }
        public string? GuestName { get; set; }
    }

    public class LeaderboardEntry
    {
        public string Name { get; set; } = string.Empty;
        public int Score { get; set; }
        public bool IsGuest { get; set; }
    }
} 