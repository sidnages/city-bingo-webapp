import React from 'react';
import BingoSquare from './BingoSquare';
import type { Challenge } from '../../types/game';

interface BingoCardProps {
  challenges: Challenge[];
  onSquareClick: (challenge: Challenge) => void;
}

const BingoCard: React.FC<BingoCardProps> = ({ challenges, onSquareClick }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 'clamp(4px, 1.5vw, 12px)',
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      padding: 'clamp(8px, 3vw, 24px)',
      backgroundColor: 'var(--color-white)',
      borderRadius: 'var(--radius-lg)',
      border: '8px solid var(--color-primary)'
    }} className="fun-shadow">
      {challenges.map((challenge) => (
        <BingoSquare 
          key={challenge.id} 
          challenge={challenge} 
          onClick={() => onSquareClick(challenge)} 
        />
      ))}
    </div>
  );
};

export default BingoCard;
