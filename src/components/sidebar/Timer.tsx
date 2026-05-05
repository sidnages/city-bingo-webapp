import React, { useState, useEffect, useCallback } from 'react';
import { Timer as TimerIcon, Play } from 'lucide-react';

interface TimerProps {
  startedAt: string | null;
  durationSeconds: number;
  onStart: () => void;
}

const Timer: React.FC<TimerProps> = ({ startedAt, durationSeconds, onStart }) => {
  const calculateTimeLeft = useCallback(() => {
    if (!startedAt) return durationSeconds;
    const startTime = new Date(startedAt).getTime();
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return Math.max(0, durationSeconds - elapsed);
  }, [startedAt, durationSeconds]);

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // Initial check
    const initialRemaining = calculateTimeLeft();
    setTimeLeft(initialRemaining);
    setIsFinished(initialRemaining === 0 && startedAt !== null);

    if (!startedAt || initialRemaining === 0) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        setIsFinished(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt, durationSeconds, calculateTimeLeft]);

  const formatTime = (seconds: number) => {
    if (isFinished) return "Time's Up";
    
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    const displayMins = mins % 60;
    const displaySecs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${displayMins.toString().padStart(2, '0')}:${displaySecs.toString().padStart(2, '0')}`;
    }
    return `${displayMins.toString().padStart(2, '0')}:${displaySecs.toString().padStart(2, '0')}`;
  };

  const isPending = !startedAt;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        backgroundColor: 'var(--color-white)',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--radius-md)',
        color: isPending ? '#9CA3AF' : (isFinished ? 'var(--color-secondary)' : 'var(--color-primary)'),
        fontWeight: 'bold',
        fontSize: '1.5rem',
        border: `2px solid ${isPending ? '#E5E7EB' : (isFinished ? 'var(--color-secondary)' : 'var(--color-primary)')}`,
        opacity: isPending ? 0.6 : 1,
        transition: 'all 0.3s'
      }} className={!isPending ? "fun-shadow" : ""}>
        <TimerIcon size={28} />
        <span style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>
          {isPending ? formatTime(durationSeconds) : formatTime(timeLeft)}
        </span>
      </div>

      {isPending && (
        <button
          onClick={onStart}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            padding: '1rem',
            backgroundColor: 'var(--color-secondary)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            fontWeight: '800',
            fontSize: '1rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            cursor: 'pointer'
          }}
          className="pulse-animation"
        >
          <Play size={20} fill="white" />
          START RUN
        </button>
      )}

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
          50% { transform: scale(1.02); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2); }
          100% { transform: scale(1); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        }
        .pulse-animation {
          animation: pulse 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Timer;
