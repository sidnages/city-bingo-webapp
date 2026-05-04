import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import type { Challenge } from '../../types/game';

interface ChallengeModalProps {
  challenge: Challenge | null;
  onClose: () => void;
  onComplete: (id: string) => void;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ challenge, onClose, onComplete }) => {
  if (!challenge) return null;

  return (
    <AnimatePresence>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(4px)'
          }}
        />
        
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 20 }}
          style={{
            position: 'relative',
            backgroundColor: 'var(--color-white)',
            width: '100%',
            maxWidth: '400px',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}
          className="fun-shadow"
        >
          <button 
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              padding: '0.5rem',
              borderRadius: '50%',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-accent)'
            }}
          >
            <X size={20} />
          </button>

          <div style={{ textAlign: 'center' }}>
            <h2 style={{ 
              color: 'var(--color-secondary)', 
              fontSize: '1.5rem', 
              marginBottom: '0.5rem',
              fontWeight: 'bold'
            }}>
              {challenge.title}
            </h2>
            <div style={{ 
              height: '4px', 
              width: '40px', 
              backgroundColor: 'var(--color-primary)', 
              margin: '0 auto',
              borderRadius: '2px'
            }} />
          </div>

          <p style={{ 
            color: 'var(--color-text)', 
            lineHeight: '1.6', 
            textAlign: 'center',
            fontSize: '1.1rem'
          }}>
            {challenge.description}
          </p>

          {!challenge.isCompleted && !challenge.is_free_space && (
            <button
              onClick={() => onComplete(challenge.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-white)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                marginTop: '1rem',
                transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <Check size={24} strokeWidth={3} />
              Mark as Complete
            </button>
          )}

          {challenge.isCompleted && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              color: 'var(--color-secondary)',
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}>
              <Check size={24} />
              Completed!
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChallengeModal;
