import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RulesModal from '../../../src/components/bingo/RulesModal';

const mockPoints = {
  square: 1,
  bingo: 2,
  unique: 3,
  rules: 'Test Rules'
};

describe('RulesModal', () => {
  it('renders scoring details and rules', () => {
    render(<RulesModal onClose={() => {}} points={mockPoints} />);
    expect(screen.getByText('1 point(s)')).toBeInTheDocument();
    expect(screen.getByText('2 point(s)')).toBeInTheDocument();
    expect(screen.getByText('3 point(s)')).toBeInTheDocument();
    expect(screen.getByText('Test Rules')).toBeInTheDocument();
  });

  it('calls onClose when close button or X is clicked', () => {
    const onClose = vi.fn();
    render(<RulesModal onClose={onClose} points={mockPoints} />);
    
    fireEvent.click(screen.getByText('Close'));
    expect(onClose).toHaveBeenCalledTimes(1);

    // Click the X button (first button in the document)
    const xButton = screen.getAllByRole('button')[0];
    fireEvent.click(xButton);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
