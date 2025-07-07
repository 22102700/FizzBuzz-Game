import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { getGames, submitAnswer, endSession } from '../api';

export default function Play() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const timerSeconds = Number(searchParams.get('timer')) || 60;
  const location = useLocation();
  const [game, setGame] = useState<any>(location.state?.game || null);
  const [number, setNumber] = useState<number | null>(location.state?.firstNumber || null);
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(timerSeconds);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timeLeft <= 0) {
      // End the session when timer runs out
      if (sessionId) {
        endSession(Number(sessionId)).catch(console.error);
      }
      navigate(`/result/${sessionId}`, { state: { finished: true } });
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(timerRef.current!);
  }, [timeLeft, navigate, sessionId]);

  useEffect(() => {
    if (!game) {
      getGames().then(games => {
        const found = games.find((g: any) => g.id === Number(sessionId));
        setGame(found);
      });
    }
  }, [sessionId, game]);

  useEffect(() => {
    // Get the first number from the session (simulate by random for now)
    if (number === null && game) {
      setNumber(game.minNumber + Math.floor(Math.random() * (game.maxNumber - game.minNumber + 1)));
    }
  }, [game, number]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number) return;
    const res = await submitAnswer(Number(sessionId), { number, userInput: input });
    setFeedback(res.correct ? 'Correct!' : 'Incorrect!');
    setNumber(res.nextNumber);
    setInput('');
  };

  const handleGiveUp = async () => {
    if (sessionId) {
      await endSession(Number(sessionId));
    }
    navigate(`/result/${sessionId}`, { state: { giveUp: true } });
  };

  if (!game && number === null) return <div>Loading game...</div>;
  if (!game) return <div style={{ color: 'red', padding: 24 }}>Game not found. Please return to the Games list and start a new session.</div>;

  return (
    <div style={{ padding: 24, minHeight: '80vh', position: 'relative' }}>
      <h2>Playing: {game.name}</h2>
      <div>Time left: {timeLeft}s</div>
      <div
        style={{
          background: 'rgba(220,53,69,0.12)',
          border: '2px solid #dc3545',
          color: '#dc3545',
          borderRadius: 10,
          padding: '14px 0',
          margin: '18px 0 24px 0',
          fontWeight: 700,
          fontSize: 20,
          textAlign: 'center',
          letterSpacing: 1
        }}
      >
        Rules: {game.rules.map((r: any) => `${r.word} for ÷${r.divisor}`).join(', ')}
      </div>
      <div style={{ fontSize: 32, margin: '24px 0' }}>{number}</div>
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12 }}>
        <input 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          autoFocus 
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px',
            marginRight: '8px'
          }}
        />
        <button 
          type="submit"
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 24px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 600
          }}
        >
          Submit
        </button>
      </form>
      {feedback && <div style={{ marginTop: 16 }}>{feedback}</div>}

      {/* Give Up Button at the bottom right */}
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        style={{
          position: 'fixed',
          right: 32,
          bottom: 32,
          backgroundColor: '#dc3545',
          color: 'white',
          border: 'none',
          padding: '16px 40px',
          borderRadius: '12px',
          cursor: 'pointer',
          fontSize: '22px',
          fontWeight: 800,
          boxShadow: '0 2px 12px rgba(220,53,69,0.18)',
          zIndex: 100,
          transition: 'background 0.2s, box-shadow 0.2s',
        }}
      >
        Give Up
      </button>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 200
        }}>
          <div style={{
            background: 'white',
            borderRadius: 12,
            padding: 32,
            minWidth: 320,
            boxShadow: '0 4px 24px rgba(0,0,0,0.18)',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: 16 }}>Are you sure you want to give up?</h3>
            <p style={{ color: '#555', marginBottom: 24 }}>Your progress will be lost for this session.</p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                onClick={handleGiveUp}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '10px 28px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Yes, give up
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                style={{
                  backgroundColor: '#eee',
                  color: '#333',
                  border: 'none',
                  padding: '10px 28px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '16px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 