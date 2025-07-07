import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api';

interface AuthContextType {
  user: any;
  token: string | null;
  login: (token: string, user: any) => void;
  logout: () => void;
}

export const AuthContext = React.createContext<AuthContextType>({
  user: null,
  token: localStorage.getItem('token'),
  login: () => {},
  logout: () => {},
});

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let response;
      if (isLogin) {
        response = await login(username, password);
      } else {
        response = await register(username, email, password);
      }

      if (response.success) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        auth.login(response.token, response.user);
        navigate('/');
      } else {
        setError(response.message || 'An error occurred. Please try again.');
      }
    } catch (err: any) {
      if (err && err.message) {
        setError(err.message);
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            {isLogin ? '🔑' : '📝'}
          </div>
          <h2 className="auth-title">{isLogin ? 'Welcome Back!' : 'Join the Fun!'}</h2>
          <p className="auth-subtitle">
            {isLogin 
              ? 'Sign in to continue your FizzBuzz adventure' 
              : 'Create an account to start playing amazing games'
            }
          </p>
        </div>
        
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-username" className="form-label">
              <span className="label-icon">👤</span>
              Username
            </label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="form-input"
              placeholder="Enter your username"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label htmlFor="register-email" className="form-label">
                <span className="label-icon">📧</span>
                Email
              </label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
                placeholder="Enter your email"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">
              <span className="label-icon">🔒</span>
              Password
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`btn btn-primary auth-submit ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <div className="loading"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{isLogin ? '🚀' : '🎉'}</span>
                {isLogin ? 'Sign In' : 'Create Account'}
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="btn btn-ghost auth-toggle"
          >
            <span>{isLogin ? '📝' : '🔑'}</span>
            {isLogin ? 'Need an account? Register' : 'Have an account? Sign In'}
          </button>
        </div>

        <div className="auth-features">
          <div className="feature">
            <span className="feature-icon">🎮</span>
            <span className="feature-text">Play Amazing Games</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🏆</span>
            <span className="feature-text">Compete on Leaderboards</span>
          </div>
          <div className="feature">
            <span className="feature-icon">⭐</span>
            <span className="feature-text">Track Your Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
} 