import React from 'react';
import { X, Info } from 'lucide-react';

interface RulesModalProps {
  onClose: () => void;
  points: { square: number; bingo: number; unique: number; rules?: string };
  hasBonuses?: boolean;
}

const RulesModal: React.FC<RulesModalProps> = ({ onClose, points }) => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)',
        maxWidth: '400px',
        width: '100%',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={24} color="var(--color-primary)" />
              Rules
            </h2>
            <button onClick={onClose}><X size={24} /></button>
          </div>
          
          {points.rules && (
            <>
              <p style={{ 
                fontSize: '1rem', 
                fontWeight: '700', 
                color: 'var(--color-secondary)', 
                marginTop: '1.25rem', 
                marginBottom: '0',
                borderBottom: '2px solid var(--color-bg-dark)',
                paddingBottom: '0.25rem'
              }}>General</p>
              <p style={{ color: '#374151', marginTop: '0.5rem', whiteSpace: 'pre-wrap' }}>
                {points.rules}
              </p>
            </>
          )}
          <p style={{ 
            fontSize: '1rem', 
            fontWeight: '700', 
            color: 'var(--color-secondary)', 
            marginTop: '1.25rem', 
            marginBottom: '0.75rem',
            paddingBottom: '0'
          }}>Scoring</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0.5rem 0 0 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><strong>{points.square} point(s)</strong> per completed challenge square</li>
            <li><strong>{points.bingo} point(s)</strong> bonus for every Bingo</li>
            <li><strong>{points.unique} point(s)</strong> bonus for every unique challenge (completed only by your team)</li>
            <li style={{ 
              marginTop: '0.25rem', 
              paddingTop: '0.75rem', 
              borderTop: '1px dashed #E5E7EB',
              fontSize: '0.9rem',
              color: '#4B5563',
              fontStyle: 'italic'
            }}>
              Bonus challenges are worth the number of points specified
            </li>
          </ul>
        </div>
        <button 
          onClick={onClose}
          style={{
            marginTop: '1.5rem',
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'var(--color-secondary)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            fontWeight: 'bold'
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default RulesModal;
