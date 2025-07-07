import { useEffect, useState, useContext } from 'react';
import { getGames, startSession, deleteGame } from '../api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './Login';

export default function GameList() {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(60);
  const [guestName, setGuestName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      setLoading(true);
      setError('');
      const gamesData = await getGames();
      setGames(gamesData);
    } catch (err: any) {
      setError('Failed to load games. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async (gameId: number | undefined) => {
    if (!gameId) {
      setError('Game not found or has been deleted.');
      return;
    }
    
    // If user is not logged in and no guest name provided, prompt for guest name
    if (!user && !guestName.trim()) {
      const name = prompt('Enter your name to play as guest:');
      if (!name || !name.trim()) {
        setError('Please enter a name to continue.');
        return;
      }
      setGuestName(name.trim());
    }
    
    try {
      const session = await startSession(gameId, token || undefined, user ? undefined : guestName);
      const game = games.find(g => g.id === gameId);
      navigate(`/play/${session.sessionId}?timer=${timer}`, { state: { game, firstNumber: session.firstNumber } });
    } catch (err: any) {
      setError(err?.message || 'Failed to start game. Please try again.');
    }
  };

  const handleDelete = async (gameId: number) => {
    if (window.confirm('Are you sure you want to delete this game?')) {
      try {
        await deleteGame(gameId);
        setGames(games => games.filter(g => g.id !== gameId));
      } catch (err: any) {
        setError('Failed to delete game. Please try again.');
      }
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading amazing games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">🎮</span>
            Available Games
          </h1>
          <p className="page-subtitle">
            Choose from our collection of exciting FizzBuzz games and start playing!
          </p>
        </div>
        
        <div className="game-controls">
          <div className="timer-control">
            <label htmlFor="game-timer" className="control-label">
              <span className="label-icon">⏱️</span>
              Game Timer (seconds)
            </label>
            <input
              id="game-timer"
              type="number"
              value={timer}
              min={10}
              max={600}
              onChange={e => setTimer(Number(e.target.value))}
              className="timer-input"
            />
          </div>
          
          {!user && (
            <div className="guest-control">
              <label htmlFor="guest-name" className="control-label">
                <span className="label-icon">👤</span>
                Guest Name
              </label>
              <input
                id="guest-name"
                type="text"
                value={guestName}
                onChange={e => setGuestName(e.target.value)}
                placeholder="Enter your name"
                className="guest-input"
              />
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      {games.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎯</div>
          <h3>No Games Available</h3>
          <p>Be the first to create an amazing FizzBuzz game!</p>
          <button 
            onClick={() => navigate('/create')}
            className="btn btn-primary"
          >
            <span>➕</span>
            Create Your First Game
          </button>
        </div>
      ) : (
        <div className="games-grid">
          {games.map(game => (
            <div key={game.id} className="game-card">
              <div className="game-header">
                <div className="game-icon">🎲</div>
                <div className="game-info">
                  <h3 className="game-title">{game.name}</h3>
                  <p className="game-author">by {game.author}</p>
                </div>
              </div>
              
              <div className="game-details">
                <div className="game-stat">
                  <span className="stat-icon">📊</span>
                  <span className="stat-label">Range:</span>
                  <span className="stat-value">{game.minNumber} - {game.maxNumber}</span>
                </div>
                
                <div className="game-rules">
                  <span className="rules-icon">📋</span>
                  <span className="rules-label">Rules:</span>
                  <div className="rules-list">
                    {game.rules.map((r: any, index: number) => (
                      <span key={index} className="rule-item">
                        {r.word} for ÷{r.divisor}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="game-actions">
                <button 
                  onClick={() => handleStart(game.id)}
                  className="btn btn-primary game-start"
                >
                  <span>🚀</span>
                  Start Game
                </button>
                
                <button 
                  onClick={() => handleDelete(game.id)} 
                  className="btn btn-danger game-delete"
                >
                  <span>🗑️</span>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 