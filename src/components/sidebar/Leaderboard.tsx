import React, { useState, useEffect } from 'react';
import { Trophy, Timer as TimerIcon, Play, AlertCircle } from 'lucide-react';
import type { Team } from '../../types/game';

interface LeaderboardProps {
  teams: Team[];
  currentTeamId: string;
  gameDurationSeconds: number;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ teams, currentTeamId, gameDurationSeconds }) => {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

  const getTeamStatus = (team: Team) => {
    if (!team.started_at) return 'pending';
    
    const startTime = new Date(team.started_at).getTime();
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    return elapsed >= gameDurationSeconds ? 'finished' : 'running';
  };

  const formatTeamTime = (team: Team) => {
    if (!team.started_at) return 'Ready';
    
    const startTime = new Date(team.started_at).getTime();
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, gameDurationSeconds - elapsed);
    
    if (remaining === 0) return 'Time Up';
    
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Re-render every second to update leaderboard timers
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      backgroundColor: 'var(--color-white)',
      padding: '1.5rem',
      borderRadius: 'var(--radius-lg)',
      width: '100%',
      minWidth: '280px'
    }} className="fun-shadow">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1.5rem',
        color: 'var(--color-accent)',
        fontWeight: 'bold',
        fontSize: '1.2rem'
      }}>
        <Trophy size={24} />
        <h2>Leaderboard</h2>
      </div>

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem',
        maxHeight: '400px',
        overflowY: 'auto',
        paddingRight: '4px'
      }} className="custom-scrollbar">
        {sortedTeams.map((team, index) => {
          const status = getTeamStatus(team);
          return (
            <div 
              key={team.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                backgroundColor: team.id === currentTeamId ? 'rgba(255, 140, 66, 0.1)' : 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                borderLeft: team.id === currentTeamId ? '4px solid var(--color-primary)' : 'none',
                opacity: status === 'finished' ? 0.8 : 1
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ 
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    color: index === 0 ? '#B8860B' : '#6B7280'
                  }}>
                    #{index + 1}
                  </span>
                  <span style={{ fontWeight: team.id === currentTeamId ? 'bold' : '600', fontSize: '0.9rem' }}>
                    {team.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem' }}>
                  <TimerIcon size={12} color={status === 'running' ? 'var(--color-primary)' : '#9CA3AF'} />
                  <span style={{ 
                    color: status === 'running' ? 'var(--color-primary)' : (status === 'finished' ? 'var(--color-secondary)' : '#9CA3AF'),
                    fontWeight: status === 'running' ? 'bold' : '500'
                  }}>
                    {formatTeamTime(team)}
                  </span>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ 
                  fontWeight: '800', 
                  color: 'var(--color-secondary)',
                  fontSize: '1.25rem',
                  lineHeight: 1
                }}>
                  {team.score}
                </div>
                <div style={{ fontSize: '0.65rem', color: '#9CA3AF', fontWeight: 'bold' }}>SQUARES</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Leaderboard;
