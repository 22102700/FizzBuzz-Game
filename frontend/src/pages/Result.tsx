import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getScore } from '../api';

export default function Result() {
  const { sessionId } = useParams();
  const location = useLocation();
  const [score, setScore] = useState<{ correct: number; incorrect: number } | null>(null);

  // Determine how the game ended
  const finished = location.state?.finished;
  const giveUp = location.state?.giveUp;

  // Motivational messages for finishing
  const finishMessages = [
    'Good job but there is still room to improve.',
    'You did well.',
    'Nice work but I know this is not your best work.'
  ];
  // Pick a random message
  const randomFinishMsg = finishMessages[Math.floor(Math.random() * finishMessages.length)];

  useEffect(() => {
    getScore(Number(sessionId)).then(setScore);
  }, [sessionId]);

  if (!score) return <div>Loading score...</div>;

  return (
    <div style={{ padding: 24 }}>
      {giveUp ? (
        <>
          <h2>Game Over</h2>
          <div style={{ marginBottom: 12, color: '#dc3545', fontWeight: 700, fontSize: 20 }}>At least you tried</div>
        </>
      ) : finished ? (
        <>
          <h2>Game Finished</h2>
          <div style={{ marginBottom: 12, color: '#198754', fontWeight: 700, fontSize: 20 }}>{randomFinishMsg}</div>
        </>
      ) : (
        <h2>Game Over</h2>
      )}
      <div>Correct: {score.correct}</div>
      <div>Incorrect: {score.incorrect}</div>
      <Link to="/">Back to Games</Link>
    </div>
  );
} 