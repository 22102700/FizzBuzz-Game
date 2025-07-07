using Microsoft.EntityFrameworkCore;
using FizzBuzzGame.Models;

namespace FizzBuzzGame
{
    public class FizzBuzzContext : DbContext
    {
        public FizzBuzzContext(DbContextOptions<FizzBuzzContext> options) : base(options) { }

        public DbSet<Game> Games => Set<Game>();
        public DbSet<Rule> Rules => Set<Rule>();
        public DbSet<Session> Sessions => Set<Session>();
        public DbSet<Answer> Answers => Set<Answer>();
        public DbSet<User> Users => Set<User>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Game>()
                .HasMany(g => g.Rules)
                .WithOne(r => r.Game!)
                .HasForeignKey(r => r.GameId);

            modelBuilder.Entity<Game>()
                .HasMany<Session>()
                .WithOne(s => s.Game!)
                .HasForeignKey(s => s.GameId);

            modelBuilder.Entity<Session>()
                .HasMany(s => s.Answers)
                .WithOne(a => a.Session!)
                .HasForeignKey(a => a.SessionId);

            modelBuilder.Entity<User>()
                .HasMany(u => u.Sessions)
                .WithOne(s => s.User)
                .HasForeignKey(s => s.UserId);

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();
        }
    }
} 