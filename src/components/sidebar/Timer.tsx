import React, { useState, useEffect } from 'react';
import { Timer as TimerIcon } from 'lucide-react';

interface TimerProps {
  startTime: number;
  durationSeconds: number;
}

const Timer: React.FC<TimerProps> = ({ startTime, durationSeconds }) => {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeLeft(Math.max(0, durationSeconds - elapsed));
    }, 1000);
    return () => clearInterval(interval);
  }, [startTime, durationSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const hours = Math.floor(mins / 60);
    const displayMins = mins % 60;
    
    return `${hours.toString().padStart(2, '0')}:${displayMins.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      backgroundColor: 'var(--color-white)',
      padding: '1rem 1.5rem',
      borderRadius: 'var(--radius-md)',
      color: 'var(--color-secondary)',
      fontWeight: 'bold',
      fontSize: '1.25rem',
      border: '2px solid var(--color-primary)'
    }} className="fun-shadow">
      <TimerIcon size={24} />
      <span>{formatTime(timeLeft)}</span>
    </div>
  );
};

export default Timer;
