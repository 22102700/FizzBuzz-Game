import { useEffect, useState } from 'react';
import { getLeaderboard } from '../api';

interface LeaderboardEntry {
  name: string;
  score: number;
  isGuest: boolean;
}

const DEMO_ENTRIES: LeaderboardEntry[] = [
  { name: 'Sheldon', score: 1000, isGuest: false },
  { name: 'Jamie', score: 50, isGuest: false },
  { name: 'Zhone', score: 25, isGuest: false },
  { name: 'Kevin', score: 20, isGuest: false },
  { name: 'Mark', score: 15, isGuest: false },
];

export default function Leaderboard() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();
        setLeaderboardData(data);
      } catch (error) {
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) {
    return <div style={{ padding: 24, textAlign: 'center' }}>Loading leaderboard...</div>;
  }

  // Merge real and demo entries, keeping highest score for each name
  const merged = [...leaderboardData, ...DEMO_ENTRIES]
    .reduce((acc: Record<string, LeaderboardEntry>, entry) => {
      if (!acc[entry.name] || entry.score > acc[entry.name].score) {
        acc[entry.name] = entry;
      }
      return acc;
    }, {});

  // Sort by score descending, take top 10
  const sortedLeaderboard = Object.values(merged)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ color: 'white', background: '#dc3545', padding: '12px 0', borderRadius: 8, textAlign: 'center', marginBottom: 24 }}>Leaderboard</h2>
      <div style={{ 
        maxWidth: 600, 
        margin: '0 auto',
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
      }}>
        {/* Header Row */}
        <div style={{
          display: 'flex',
          background: '#007bff',
          color: 'white',
          fontWeight: 700,
          borderRadius: 8,
          marginBottom: 8,
          padding: '12px 0',
          fontSize: 18
        }}>
          <div style={{ flex: 1, textAlign: 'center' }}>Rank</div>
          <div style={{ flex: 2, textAlign: 'center' }}>Name</div>
          <div style={{ flex: 1, textAlign: 'center' }}>Score</div>
        </div>
        {/* Leaderboard Rows */}
        {sortedLeaderboard.map((entry: LeaderboardEntry, index: number) => (
          <div
            key={entry.name}
            style={{
              display: 'flex',
              alignItems: 'center',
              background: index === 0 ? '#fff3cd' : 'white',
              borderRadius: 8,
              marginBottom: 8,
              boxShadow: index === 0 ? '0 2px 8px rgba(255, 193, 7, 0.08)' : '0 1px 2px rgba(0,0,0,0.03)',
              fontWeight: index === 0 ? 700 : 500,
              fontSize: 17,
              color: index === 0 ? '#222' : '#333',
              border: '1px solid #f0f0f0',
              minHeight: 48
            }}
          >
            <div style={{ flex: 1, textAlign: 'center', fontSize: 22 }}>
              {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : <span style={{ color: '#bbb' }}>{index + 1}</span>}
            </div>
            <div style={{ flex: 2, textAlign: 'center', fontWeight: index === 0 ? 700 : 500 }}>
              {entry.name} {entry.isGuest && <span style={{ color: '#6c757d', fontSize: '0.8em' }}>(Guest)</span>}
            </div>
            <div style={{ flex: 1, textAlign: 'center', fontWeight: 700, color: index === 0 ? '#28a745' : '#007bff', fontSize: 20 }}>
              {entry.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 