import React from 'react';
import { Trophy } from 'lucide-react';
import type { Team } from '../../types/game';

interface LeaderboardProps {
  teams: Team[];
  currentTeamId: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ teams, currentTeamId }) => {
  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sortedTeams.map((team, index) => (
          <div 
            key={team.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              backgroundColor: team.id === currentTeamId ? 'rgba(255, 140, 66, 0.1)' : 'var(--color-bg)',
              borderRadius: 'var(--radius-md)',
              borderLeft: team.id === currentTeamId ? '4px solid var(--color-primary)' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ 
                width: '24px', 
                height: '24px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                backgroundColor: index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? '#CD7F32' : 'transparent',
                borderRadius: '50%',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                {index + 1}
              </span>
              <span style={{ fontWeight: team.id === currentTeamId ? 'bold' : '500' }}>
                {team.name} {team.id === currentTeamId && '(You)'}
              </span>
            </div>
            <span style={{ 
              fontWeight: 'bold', 
              color: 'var(--color-secondary)',
              fontSize: '1.1rem'
            }}>
              {team.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
