import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ChallengeModal from '../../../src/components/bingo/ChallengeModal';

const mockChallenge = {
  id: '1',
  game_id: 'game1',
  title: 'Test Challenge',
  description: 'Test Description',
  position: 0,
  is_free_space: false,
  isCompleted: false
};

describe('ChallengeModal', () => {
  it('renders challenge details', () => {
    render(
      <ChallengeModal 
        challenge={mockChallenge} 
        onClose={() => {}} 
        onComplete={() => {}} 
        canComplete={true} 
      />
    );
    expect(screen.getByText('Test Challenge')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <ChallengeModal 
        challenge={mockChallenge} 
        onClose={onClose} 
        onComplete={() => {}} 
        canComplete={true} 
      />
    );
    // There are multiple X icons, but the button has the onClose
    const closeButton = screen.getAllByRole('button')[0]; 
    fireEvent.click(closeButton);
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onComplete when "Mark as Complete" is clicked', () => {
    const onComplete = vi.fn();
    render(
      <ChallengeModal 
        challenge={mockChallenge} 
        onClose={() => {}} 
        onComplete={onComplete} 
        canComplete={true} 
      />
    );
    fireEvent.click(screen.getByText('Mark as Complete'));
    expect(onComplete).toHaveBeenCalledWith(mockChallenge, '');
  });

  it('shows and validates Instagram URL if required', () => {
    const onComplete = vi.fn();
    render(
      <ChallengeModal 
        challenge={mockChallenge} 
        onClose={() => {}} 
        onComplete={onComplete} 
        canComplete={true} 
        requireInstagram={true}
      />
    );
    
    expect(screen.getByLabelText('Instagram Post URL')).toBeInTheDocument();
    
    // Try to complete without URL
    fireEvent.click(screen.getByText('Mark as Complete'));
    expect(screen.getByText('URL must start with https://www.instagram.com/')).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();

    // Enter valid URL
    fireEvent.change(screen.getByPlaceholderText('https://www.instagram.com/p/...'), {
      target: { value: 'https://www.instagram.com/p/abc' }
    });
    fireEvent.click(screen.getByText('Mark as Complete'));
    expect(onComplete).toHaveBeenCalledWith(mockChallenge, 'https://www.instagram.com/p/abc');
  });

  it('shows disabled reason when canComplete is false', () => {
    render(
      <ChallengeModal 
        challenge={mockChallenge} 
        onClose={() => {}} 
        onComplete={() => {}} 
        canComplete={false} 
        disabledReason="Game not started"
      />
    );
    expect(screen.getByText('Game not started')).toBeInTheDocument();
    expect(screen.getByText('Mark as Complete')).toBeDisabled();
  });

  it('shows and handles "Mark as Incomplete" when challenge is completed', () => {
    const onComplete = vi.fn();
    const completedChallenge = { ...mockChallenge, isCompleted: true };
    render(
      <ChallengeModal 
        challenge={completedChallenge} 
        onClose={() => {}} 
        onComplete={onComplete} 
        canComplete={true} 
      />
    );
    
    expect(screen.getByText('Mark as Incomplete')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Mark as Incomplete'));
    expect(onComplete).toHaveBeenCalledWith(completedChallenge);
  });

  it('disables "Mark as Incomplete" when canComplete is false', () => {
    const completedChallenge = { ...mockChallenge, isCompleted: true };
    render(
      <ChallengeModal 
        challenge={completedChallenge} 
        onClose={() => {}} 
        onComplete={() => {}} 
        canComplete={false} 
        disabledReason="Scores published"
      />
    );
    
    expect(screen.getByText('Mark as Incomplete')).toBeDisabled();
    expect(screen.getByText('Scores published')).toBeInTheDocument();
  });

  it('does not show mark buttons for free space', () => {
    const freeSpaceChallenge = { ...mockChallenge, is_free_space: true, isCompleted: true };
    render(
      <ChallengeModal 
        challenge={freeSpaceChallenge} 
        onClose={() => {}} 
        onComplete={() => {}} 
        canComplete={true} 
      />
    );
    
    expect(screen.queryByText('Mark as Complete')).not.toBeInTheDocument();
    expect(screen.queryByText('Mark as Incomplete')).not.toBeInTheDocument();
    expect(screen.getByText('Free Space!')).toBeInTheDocument();
  });

  it('renders "View Instagram Post" link if instagramUrl is present', () => {
    const challengeWithInsta = { 
      ...mockChallenge, 
      isCompleted: true, 
      instagramUrl: 'https://www.instagram.com/p/abc' 
    };
    render(
      <ChallengeModal 
        challenge={challengeWithInsta} 
        onClose={() => {}} 
        onComplete={() => {}} 
        canComplete={true} 
      />
    );
    
    const link = screen.getByText('View Instagram Post');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', 'https://www.instagram.com/p/abc');
  });
});
