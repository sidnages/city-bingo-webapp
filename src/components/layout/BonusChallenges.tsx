import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, Clock, Camera } from 'lucide-react';
import type { BonusChallenge } from '../../types/game';

interface BonusChallengesProps {
  challenges: (BonusChallenge)[];
  onChallengeClick: (challenge: BonusChallenge) => void;
}

const BonusChallenges: React.FC<BonusChallengesProps> = ({ challenges, onChallengeClick }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.floor(Math.max(0, seconds) % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategorized = () => {
    return challenges.reduce((acc, c) => {
      const startTime = new Date(c.created_at).getTime();
      const durationSeconds = c.duration_minutes * 60;
      const elapsedSeconds = startTime ? (Date.now() - startTime) / 1000 : 0;
      
      const endsInSeconds = durationSeconds - elapsedSeconds;

      if (c.isCompleted) {
        acc.completed.push(c);
      } else if (startTime && elapsedSeconds < durationSeconds) {
        acc.active.push({ ...c, endsInSeconds });
      } else {
        acc.expired.push(c);
      }
      return acc;
    }, { active: [] as any[], completed: [] as any[], expired: [] as any[] });
  };

  const categorized = getCategorized();
  const orderedChallenges = [...categorized.active, ...categorized.completed, ...categorized.expired];

  return (
    <div style={{
      backgroundColor: 'var(--color-white)',
      padding: '1rem',
      borderRadius: 'var(--radius-lg)',
      maxWidth: '400px',
      boxSizing: 'border-box'
    }} className="fun-shadow">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
        color: 'var(--color-primary)',
        fontWeight: 'bold',
        fontSize: '0.9rem'
      }}>
        <Zap size={18} fill="var(--color-primary)" />
        <h2 style={{ margin: 0 }}>Bonus Challenges</h2>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.5rem',
        maxHeight: '180px',
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {challenges.length === 0 ? (
          <div style={{
            padding: '1.5rem',
            textAlign: 'center',
            color: '#6B7280',
            fontSize: '0.85rem',
            border: '2px dashed #E5E7EB',
            borderRadius: 'var(--radius-md)'
          }}>
            No bonus challenges have been sent.
          </div>
        ) : (
          orderedChallenges.map(c => {
            const isActive = categorized.active.some(a => a.id === c.id);
            const isDone = c.isCompleted;

            return (
              <button 
                key={c.id} 
                onClick={() => onChallengeClick(c)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.6rem 0.75rem',
                  backgroundColor: isDone ? 'var(--color-secondary)' : (isActive ? 'white' : '#F9FAFB'),
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${isDone ? 'var(--color-secondary)' : (isActive ? 'var(--color-primary)' : '#E5E7EB')}`,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.15rem',
                  transition: 'all 0.2s ease',
                  opacity: !isActive && !isDone ? 0.6 : 1,
                  color: isDone ? 'white' : 'inherit',
                  boxSizing: 'border-box'
                }}
              >
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.8rem', color: isDone ? 'white' : 'var(--color-text)' }}>{c.title}</span>
                    <span style={{ 
                      backgroundColor: isDone ? 'white' : (isActive ? 'var(--color-primary)' : '#9CA3AF'), 
                      color: isDone ? 'var(--color-secondary)' : 'white', 
                      padding: '1px 5px', 
                      borderRadius: '8px', 
                      fontSize: '0.6rem',
                      fontWeight: 'bold'
                    }}>
                      +{c.points}
                    </span>
                 </div>
                 
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.65rem', color: isDone ? 'rgba(255,255,255,0.9)' : (isActive ? 'var(--color-primary)' : '#9CA3AF'), fontWeight: 'bold' }}>
                      <Clock size={10} />
                      <span>{isActive ? `${formatTime(c.endsInSeconds)} left` : (isDone ? 'Finished' : 'Expired')}</span>
                    </div>
                    
                    {isDone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: 'white', fontWeight: 'bold', fontSize: '0.65rem' }}>
                        {c.instagramUrl && <Camera size={10} style={{ marginRight: '2px' }} />}
                        <CheckCircle2 size={10} />
                        Done
                      </div>
                    )}
                 </div>
              </button>
            );
          })
        )}
      </div>
      <style>{`
        div::-webkit-scrollbar { width: 4px; }
        div::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        div::-webkit-scrollbar-thumb { background: var(--color-primary); border-radius: 10px; opacity: 0.5; }
      `}</style>
    </div>
  );
};

export default BonusChallenges;
