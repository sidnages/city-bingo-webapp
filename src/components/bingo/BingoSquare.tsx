import React from 'react';
import type { Challenge } from '../../types/game';
import { CheckCircle2 } from 'lucide-react';

interface BingoSquareProps {
  challenge: Challenge;
  onClick: () => void;
}

const BingoSquare: React.FC<BingoSquareProps> = ({ challenge, onClick }) => {
  return (
    <div 
      className={`perspective ${challenge.isCompleted ? 'flipped' : ''}`}
      style={{
        width: '100%',
        aspectRatio: '1/1',
        cursor: 'pointer'
      }}
      onClick={onClick}
    >
      <div className="flip-card-inner">
        {/* Front of the card */}
        <div 
          className="flip-card-front"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(4px, 1vw, 12px)',
            textAlign: 'center',
            backgroundColor: challenge.is_free_space ? 'var(--color-primary)' : 'var(--color-white)',
            color: challenge.is_free_space ? 'var(--color-white)' : 'var(--color-text)',
            fontSize: 'clamp(0.55rem, 1.8vw, 1rem)',
            fontWeight: '600',
            border: '2px solid var(--color-primary)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
        >
          {challenge.title}
        </div>

        {/* Back of the card (Completed state) */}
        <div 
          className="flip-card-back"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(4px, 1vw, 12px)',
            textAlign: 'center',
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-white)',
            fontSize: 'clamp(0.45rem, 1.4vw, 0.8rem)',
            fontWeight: 'bold',
            border: '2px solid var(--color-secondary)'
          }}
        >
          <CheckCircle2 size={24} style={{ marginBottom: '0.25rem' }} />
          <span>COMPLETED</span>
        </div>
      </div>
    </div>
  );
};

export default BingoSquare;
