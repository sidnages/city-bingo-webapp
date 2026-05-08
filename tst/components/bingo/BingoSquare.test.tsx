import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BingoSquare from '../../../src/components/bingo/BingoSquare';

const mockChallenge = {
  id: '1',
  game_id: 'game1',
  title: 'Test Challenge',
  description: 'Test Description',
  position: 0,
  is_free_space: false,
  isCompleted: false
};

describe('BingoSquare', () => {
  it('renders challenge title on the front', () => {
    render(<BingoSquare challenge={mockChallenge} onClick={() => {}} />);
    expect(screen.getByText('Test Challenge')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<BingoSquare challenge={mockChallenge} onClick={onClick} />);
    fireEvent.click(screen.getByText('Test Challenge'));
    expect(onClick).toHaveBeenCalled();
  });

  it('shows COMPLETED on the back when isCompleted is true', () => {
    render(<BingoSquare challenge={{ ...mockChallenge, isCompleted: true }} onClick={() => {}} />);
    expect(screen.getByText('COMPLETED')).toBeInTheDocument();
  });

  it('renders FREE SPACE styling when is_free_space is true', () => {
    render(<BingoSquare challenge={{ ...mockChallenge, is_free_space: true, title: 'FREE' }} onClick={() => {}} />);
    const square = screen.getByText('FREE');
    expect(square).toHaveStyle({ backgroundColor: 'var(--color-primary)' });
  });
});
