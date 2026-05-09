import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, Clock, Lock } from 'lucide-react';
import type { BonusChallenge } from '../../types/game';

interface BonusChallengesProps {
  challenges: BonusChallenge[];
  teamStartedAt: string | null;
  onChallengeClick: (challenge: BonusChallenge) => void;
}

const BonusChallenges: React.FC<BonusChallengesProps> = ({ challenges, teamStartedAt, onChallengeClick }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (challenges.length === 0) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.max(0, seconds) / 60);
    const secs = Math.floor(Math.max(0, seconds) % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getCategorized = () => {
    if (!teamStartedAt) return { active: [], upcoming: [], completed: [], expired: [], notStarted: true };

    const startTime = new Date(teamStartedAt).getTime();
    const elapsedSeconds = (Date.now() - startTime) / 1000;

    return challenges.reduce((acc, c) => {
      const liveAtSeconds = c.release_at_minutes * 60;
      const endAtSeconds = (c.release_at_minutes + c.duration_minutes) * 60;

      if (elapsedSeconds < liveAtSeconds) {
        acc.upcoming.push({ ...c, startsInSeconds: liveAtSeconds - elapsedSeconds });
      } else if (elapsedSeconds < endAtSeconds) {
        acc.active.push({ ...c, endsInSeconds: endAtSeconds - elapsedSeconds });
      } else if (c.isCompleted) {
        acc.completed.push(c);
      } else {
        acc.expired.push(c);
      }
      return acc;
    }, { active: [] as any[], upcoming: [] as any[], completed: [] as any[], expired: [] as any[], notStarted: false });
  };

  const categorized = getCategorized();

  // Combine and order: Active first, then Upcoming, then others
  const orderedChallenges = [
    ...categorized.active,
    ...categorized.upcoming,
    ...categorized.completed,
    ...categorized.expired
  ];

  return (
    <div style={{
      backgroundColor: 'var(--color-white)',
      padding: '1rem',
      borderRadius: 'var(--radius-lg)',
      width: '100%',
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
        maxHeight: '180px', // Roughly 2 challenges
        overflowY: 'auto',
        paddingRight: '4px'
      }}>
        {categorized.notStarted && (
          <div style={{
            padding: '0.75rem',
            backgroundColor: '#F9FAFB',
            borderRadius: 'var(--radius-md)',
            border: '2px dashed #E5E7EB',
            textAlign: 'center',
            color: '#6B7280',
            fontSize: '0.8rem'
          }}>
            <p style={{ margin: 0 }}>Start to unlock bonuses!</p>
          </div>
        )}

        {orderedChallenges.map(c => {
          const isUpcoming = categorized.upcoming.some(u => u.id === c.id);
          const isActive = categorized.active.some(a => a.id === c.id);
          const isDone = c.isCompleted;
          const isExpired = !isActive && !isUpcoming && !isDone;

          if (isUpcoming) {
            return (
              <div key={c.id} style={{
                padding: '0.5rem 0.75rem',
                backgroundColor: '#F9FAFB',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed #E5E7EB',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: 0.7
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#9CA3AF' }}>
                  <Lock size={12} />
                  <span>Locked</span>
                </div>
                <span style={{ fontSize: '0.7rem', color: '#9CA3AF', fontWeight: 'bold' }}>in {formatTime(c.startsInSeconds)}</span>
              </div>
            );
          }

          return (
            <button 
              key={c.id} 
              onClick={() => onChallengeClick(c)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.6rem 0.75rem',
                backgroundColor: isDone ? 'var(--color-secondary)' : (isExpired ? '#F9FAFB' : 'white'),
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${isDone ? 'var(--color-secondary)' : (isExpired ? '#E5E7EB' : 'var(--color-primary)')}`,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.15rem',
                transition: 'all 0.2s ease',
                opacity: isExpired ? 0.6 : 1,
                color: isDone ? 'white' : 'inherit',
                boxSizing: 'border-box'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                if (!isDone && !isExpired) e.currentTarget.style.borderColor = 'var(--color-secondary)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = isDone ? 'var(--color-secondary)' : (isExpired ? '#E5E7EB' : 'var(--color-primary)');
              }}
            >
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '0.8rem', color: isDone ? 'white' : 'var(--color-text)' }}>{c.title}</span>
                  <span style={{ 
                    backgroundColor: isDone ? 'white' : (isExpired ? '#9CA3AF' : 'var(--color-primary)'), 
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.65rem', color: isDone ? 'rgba(255,255,255,0.9)' : (isExpired ? '#9CA3AF' : 'var(--color-primary)'), fontWeight: 'bold' }}>
                    <Clock size={10} />
                    <span>{isActive ? `${formatTime(c.endsInSeconds)} left` : (isDone ? 'Finished' : 'Expired')}</span>
                  </div>
                  
                  {isDone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.15rem', color: 'white', fontWeight: 'bold', fontSize: '0.65rem' }}>
                      <CheckCircle2 size={10} />
                      Done
                    </div>
                  )}
               </div>
            </button>
          );
        })}
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
