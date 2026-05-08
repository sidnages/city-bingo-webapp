import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Timer from '../../../src/components/layout/Timer';

describe('Timer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders correctly when not started', () => {
    render(
      <Timer 
        startedAt={null} 
        durationSeconds={3600} 
        onStart={() => {}} 
        gameStoppedAt={null} 
      />
    );
    expect(screen.getByText('1:00:00')).toBeInTheDocument();
    expect(screen.getByText('START RUN')).toBeInTheDocument();
  });

  it('calls onStart when start button is clicked', () => {
    const onStart = vi.fn();
    render(
      <Timer 
        startedAt={null} 
        durationSeconds={3600} 
        onStart={onStart} 
        gameStoppedAt={null} 
      />
    );
    fireEvent.click(screen.getByText('START RUN'));
    expect(onStart).toHaveBeenCalled();
  });

  it('updates time left when started', () => {
    const startedAt = new Date('2024-01-01T12:00:00Z').toISOString();
    render(
      <Timer 
        startedAt={startedAt} 
        durationSeconds={3600} 
        onStart={() => {}} 
        gameStoppedAt={null} 
      />
    );
    
    expect(screen.getByText('1:00:00')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(screen.getByText('59:59')).toBeInTheDocument();
  });

  it('shows "Time\'s Up" when finished', () => {
    const startedAt = new Date('2024-01-01T11:00:00Z').toISOString();
    render(
      <Timer 
        startedAt={startedAt} 
        durationSeconds={3600} 
        onStart={() => {}} 
        gameStoppedAt={null} 
      />
    );
    
    expect(screen.getByText("Time's Up")).toBeInTheDocument();
  });

  it('shows "Time\'s Up" when game is stopped', () => {
    const startedAt = new Date('2024-01-01T12:00:00Z').toISOString();
    const stoppedAt = new Date('2024-01-01T12:30:00Z').toISOString();
    render(
      <Timer 
        startedAt={startedAt} 
        durationSeconds={3600} 
        onStart={() => {}} 
        gameStoppedAt={stoppedAt} 
      />
    );
    
    expect(screen.getByText("Time's Up")).toBeInTheDocument();
  });
});
