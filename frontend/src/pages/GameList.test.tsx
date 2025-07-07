import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import * as api from '../api';
import GameList from './GameList';

describe('GameList', () => {
  it('renders Available Games heading', async () => {
    vi.spyOn(api, 'getGames').mockResolvedValue([]);
    render(
      <MemoryRouter>
        <GameList />
      </MemoryRouter>
    );
    expect(await screen.findByText(/Available Games/i)).toBeTruthy();
  });
}); 