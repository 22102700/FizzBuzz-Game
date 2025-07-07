import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import GameList from './pages/GameList';
import CreateGame from './pages/CreateGame';
import Play from './pages/Play';
import Result from './pages/Result';
import Leaderboard from './pages/Leaderboard';
import Login, { AuthContext } from './pages/Login';
import './App.css'
import { getProfile } from './api';

function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [showProfile, setShowProfile] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleProfileClick = async () => {
    if (!token) return;
    if (!showProfile) {
      setProfileLoading(true);
      setProfileError('');
      setShowProfile(true);
      try {
        const data = await getProfile(token);
        setProfile(data);
      } catch (err: any) {
        setProfileError(err?.message || 'Failed to load profile');
      } finally {
        setProfileLoading(false);
      }
    } else {
      setShowProfile(false);
    }
  };

  const handleLogin = (newToken: string, newUser: any) => {
    setToken(newToken);
    setUser(newUser);
    setProfile(null);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setProfile(null);
    setShowProfile(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, login: handleLogin, logout: handleLogout }}>
      <Router>
        <div className="app">
          {/* Navigation */}
          <nav className="navbar">
            <div className="container">
              <div className="nav-content">
                <div className="nav-brand">
                  <Link to="/" className="brand-link">
                    <span className="brand-icon">🎮</span>
                    <span className="brand-text">FizzBuzz Games</span>
                  </Link>
                </div>
                
                <div className="nav-links">
                  <Link to="/" className="nav-link">
                    <span className="nav-icon">🏠</span>
                    Games
                  </Link>
                  <Link to="/create" className="nav-link">
                    <span className="nav-icon">➕</span>
                    Create Game
                  </Link>
                  <Link to="/leaderboard" className="nav-link">
                    <span className="nav-icon">🏆</span>
                    Leaderboard
                  </Link>
                </div>

                <div className="nav-auth">
                  {user ? (
                    <div className="user-menu">
                      <button
                        className="btn btn-primary user-button"
                        onClick={handleProfileClick}
                      >
                        <span className="user-avatar">👤</span>
                        <span className="username">{user.username}</span>
                        <span className="dropdown-arrow">▼</span>
                      </button>
                      
                      {showProfile && (
                        <div className="profile-dropdown">
                          <div className="profile-header">
                            <h3>Profile</h3>
                          </div>
                          
                          {profileLoading ? (
                            <div className="profile-loading">
                              <div className="loading"></div>
                              <span>Loading profile...</span>
                            </div>
                          ) : profileError ? (
                            <div className="profile-error">
                              <span>⚠️ {profileError}</span>
                            </div>
                          ) : profile ? (
                            <div className="profile-info">
                              <div className="profile-stat">
                                <span className="stat-label">Username:</span>
                                <span className="stat-value">{profile.username}</span>
                              </div>
                              <div className="profile-stat">
                                <span className="stat-label">Email:</span>
                                <span className="stat-value">{profile.email}</span>
                              </div>
                              <div className="profile-stat">
                                <span className="stat-label">Total Wins:</span>
                                <span className="stat-value">🏆 {profile.totalWins}</span>
                              </div>
                              <div className="profile-stat">
                                <span className="stat-label">Highest Score:</span>
                                <span className="stat-value">⭐ {profile.highestScore}</span>
                              </div>
                              <div className="profile-stat">
                                <span className="stat-label">Best Game:</span>
                                <span className="stat-value">{profile.highestScoreGame || '-'}</span>
                              </div>
                            </div>
                          ) : null}
                          
                          <div className="profile-actions">
                            <button
                              onClick={handleLogout}
                              className="btn btn-danger"
                            >
                              <span>🚪</span>
                              Logout
                            </button>
                            <button
                              onClick={() => setShowProfile(false)}
                              className="btn btn-ghost"
                            >
                              <span>✕</span>
                              Close
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link to="/login" className="btn btn-primary">
                      <span>🔑</span>
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<GameList />} />
              <Route path="/create" element={<CreateGame />} />
              <Route path="/play/:sessionId" element={<Play />} />
              <Route path="/result/:sessionId" element={<Result />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;
