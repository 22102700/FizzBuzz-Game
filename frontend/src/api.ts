const API_BASE = '/api';

// Auth functions
export async function login(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  try {
    return await res.json();
  } catch {
    const text = await res.text();
    return { success: false, message: text || 'An unknown error occurred.' };
  }
}

export async function register(username: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  try {
    return await res.json();
  } catch {
    const text = await res.text();
    return { success: false, message: text || 'An unknown error occurred.' };
  }
}

export async function getGames() {
  const res = await fetch(`${API_BASE}/games`);
  return res.json();
}

export async function createGame(game: any) {
  const res = await fetch(`${API_BASE}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(game),
  });
  return res.json();
}

export async function startSession(gameId: number, token?: string, guestName?: string) {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameId, token, guestName }),
  });
  return res.json();
}

export async function submitAnswer(sessionId: number, answer: any) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answer),
  });
  return res.json();
}

export async function getScore(sessionId: number) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/score`);
  return res.json();
}

export async function deleteGame(id: number) {
  const res = await fetch(`${API_BASE}/games/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete game');
}

export async function getLeaderboard() {
  const res = await fetch(`${API_BASE}/sessions/leaderboard`);
  return res.json();
}

export async function endSession(sessionId: number) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/end`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return res.json();
}

export async function getProfile(token: string) {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  try {
    return await res.json();
  } catch {
    const text = await res.text();
    return { message: text || 'An unknown error occurred.' };
  }
} 