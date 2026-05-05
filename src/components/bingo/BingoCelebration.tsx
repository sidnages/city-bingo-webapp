import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';

interface BingoCelebrationProps {
  show: boolean;
  onComplete: () => void;
}

export const BingoCelebration: React.FC<BingoCelebrationProps> = ({ show, onComplete }) => {
  return (
    <AnimatePresence>
      {show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          pointerEvents: 'none'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            onAnimationComplete={() => {
              setTimeout(onComplete, 3000);
            }}
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              padding: '3rem 5rem',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem',
              boxShadow: '0 0 50px rgba(255, 140, 66, 0.5), 0 20px 25px -5px rgba(0, 0, 0, 0.2)',
              border: '8px solid white',
              position: 'relative'
            }}
          >
            {/* Decorative Stars */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1, y: [0, -100, 0], x: [0, (i % 2 === 0 ? 1 : -1) * 50, 0] }}
                transition={{ delay: 0.2 + (i * 0.1), duration: 2, repeat: Infinity }}
                style={{ position: 'absolute' }}
              >
                <Star fill="white" size={24} />
              </motion.div>
            ))}

            <motion.div
              animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <Trophy size={80} strokeWidth={2.5} />
            </motion.div>

            <h1 style={{ 
              fontSize: '5rem', 
              fontWeight: '900', 
              letterSpacing: '0.1em',
              textShadow: '4px 4px 0px var(--color-secondary)',
              margin: 0
            }}>
              BINGO!
            </h1>
            
            <p style={{ 
              fontSize: '1.5rem', 
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              opacity: 0.9
            }}>
              Amazing work team!
            </p>
          </motion.div>

          {/* Screen Flash */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'white',
              zIndex: -1
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
};
