import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BingoCard from '../../../src/components/bingo/BingoCard';

const mockChallenges = Array.from({ length: 25 }, (_, i) => ({
  id: `${i}`,
  game_id: 'game1',
  title: `Square ${i}`,
  description: `Description ${i}`,
  position: i,
  is_free_space: i === 12,
  isCompleted: false
}));

describe('BingoCard', () => {
  it('renders 25 squares', () => {
    render(<BingoCard challenges={mockChallenges} onSquareClick={() => {}} />);
    mockChallenges.forEach(challenge => {
      expect(screen.getByText(challenge.title)).toBeInTheDocument();
    });
  });

  it('calls onSquareClick when a square is clicked', () => {
    const onSquareClick = vi.fn();
    render(<BingoCard challenges={mockChallenges} onSquareClick={onSquareClick} />);
    fireEvent.click(screen.getByText('Square 0'));
    expect(onSquareClick).toHaveBeenCalledWith(mockChallenges[0]);
  });
});
