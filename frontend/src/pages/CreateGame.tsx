import React, { useState } from 'react';
import { createGame } from '../api';
import { useNavigate } from 'react-router-dom';

export default function CreateGame() {
  const [name, setName] = useState('');
  const [author, setAuthor] = useState('');
  const [minNumber, setMinNumber] = useState(1);
  const [maxNumber, setMaxNumber] = useState(100);
  const [rules, setRules] = useState([{ divisor: 3, word: 'Fizz' }, { divisor: 5, word: 'Buzz' }]);
  const [divisor, setDivisor] = useState(1);
  const [word, setWord] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const addRule = () => {
    if (divisor > 1 && word.trim()) {
      setRules([...rules, { divisor, word: word.trim() }]);
      setDivisor(1);
      setWord('');
    }
  };

  const removeRule = (i: number) => {
    setRules(rules.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await createGame({ name, author, minNumber, maxNumber, rules });
      navigate('/');
    } catch (err: any) {
      setError(err?.message || 'Failed to create game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <span className="title-icon">🎨</span>
            Create New Game
          </h1>
          <p className="page-subtitle">
            Design your own unique FizzBuzz game with custom rules and challenges!
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          <span className="alert-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="create-game-card">
        <form onSubmit={handleSubmit} className="create-game-form">
          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📝</span>
              Basic Information
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="game-name" className="form-label">
                  <span className="label-icon">🎮</span>
                  Game Name
                </label>
                <input
                  id="game-name"
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Enter an exciting game name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="game-author" className="form-label">
                  <span className="label-icon">👤</span>
                  Author
                </label>
                <input
                  id="game-author"
                  type="text"
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  required
                  className="form-input"
                  placeholder="Your name or nickname"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📊</span>
              Number Range
            </h3>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="min-number" className="form-label">
                  <span className="label-icon">🔢</span>
                  Minimum Number
                </label>
                <input
                  id="min-number"
                  type="number"
                  value={minNumber}
                  min={1}
                  onChange={e => setMinNumber(Number(e.target.value))}
                  required
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="max-number" className="form-label">
                  <span className="label-icon">🔢</span>
                  Maximum Number
                </label>
                <input
                  id="max-number"
                  type="number"
                  value={maxNumber}
                  min={minNumber}
                  onChange={e => setMaxNumber(Number(e.target.value))}
                  required
                  className="form-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">
              <span className="section-icon">📋</span>
              Game Rules
            </h3>
            
            <div className="rules-container">
              <div className="rules-list">
                {rules.map((r, i) => (
                  <div key={i} className="rule-item">
                    <div className="rule-content">
                      <span className="rule-word">{r.word}</span>
                      <span className="rule-divider">for</span>
                      <span className="rule-divisor">÷{r.divisor}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => removeRule(i)}
                      className="btn btn-danger rule-remove"
                    >
                      <span>🗑️</span>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="add-rule-section">
                <h4 className="add-rule-title">Add New Rule</h4>
                <div className="add-rule-form">
                  <div className="rule-input-group">
                    <input 
                      type="number" 
                      value={divisor} 
                      min={1} 
                      onChange={e => setDivisor(Number(e.target.value))} 
                      placeholder="Divisor"
                      className="rule-input"
                    />
                    <input 
                      value={word} 
                      onChange={e => setWord(e.target.value)} 
                      placeholder="Word to display"
                      className="rule-input"
                    />
                    <button 
                      type="button" 
                      onClick={addRule}
                      className="btn btn-success add-rule-btn"
                      disabled={!divisor || !word.trim()}
                    >
                      <span>➕</span>
                      Add Rule
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-ghost"
            >
              <span>←</span>
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading || !name.trim() || !author.trim() || rules.length === 0}
              className="btn btn-primary create-submit"
            >
              {loading ? (
                <>
                  <div className="loading"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <span>🎉</span>
                  Create Game
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 