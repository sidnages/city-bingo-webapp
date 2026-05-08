import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Lock, AlertCircle, Camera, ExternalLink } from 'lucide-react';
import type { Challenge } from '../../types/game';

interface ChallengeModalProps {
  challenge: Challenge | null;
  onClose: () => void;
  onComplete: (challenge: Challenge, instagramUrl?: string) => void;
  canComplete: boolean;
  disabledReason?: string;
  requireInstagram?: boolean;
}

const ChallengeModal: React.FC<ChallengeModalProps> = ({ 
  challenge, 
  onClose, 
  onComplete, 
  canComplete, 
  disabledReason,
  requireInstagram
}) => {
  const [instagramUrl, setInstagramUrl] = React.useState('');
  const [urlError, setUrlError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setInstagramUrl('');
    setUrlError(null);
  }, [challenge]);

  if (!challenge) return null;

  const handleComplete = () => {
    if (requireInstagram && !challenge.isCompleted) {
      if (!instagramUrl.startsWith('https://www.instagram.com/')) {
        setUrlError('URL must start with https://www.instagram.com/');
        return;
      }
    }
    onComplete(challenge, instagramUrl);
  };

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
              color: 'var(--color-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
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

          {requireInstagram && !challenge.isCompleted && !challenge.is_free_space && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--color-text)' }}>
                Instagram Post URL
              </label>
              <div style={{ position: 'relative' }}>
                <Camera size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                <input
                  type="text"
                  placeholder="https://www.instagram.com/p/..."
                  value={instagramUrl}
                  onChange={(e) => {
                    setInstagramUrl(e.target.value);
                    if (urlError) setUrlError(null);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${urlError ? '#DC2626' : '#E5E7EB'}`,
                    fontSize: '0.875rem'
                  }}
                />
              </div>
              {urlError && <span style={{ color: '#DC2626', fontSize: '0.75rem', fontWeight: '600' }}>{urlError}</span>}
            </div>
          )}

          {challenge.instagramUrl && (
            <a 
              href={challenge.instagramUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                color: 'var(--color-primary)',
                fontWeight: '700',
                fontSize: '0.9rem',
                padding: '0.5rem',
                backgroundColor: 'var(--color-bg)',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none'
              }}
            >
              <Camera size={18} />
              View Instagram Post
              <ExternalLink size={14} />
            </a>
          )}

          {!challenge.isCompleted && !challenge.is_free_space && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                disabled={!canComplete}
                onClick={handleComplete}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  backgroundColor: canComplete ? 'var(--color-primary)' : '#D1D5DB',
                  color: 'var(--color-white)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  marginTop: '1rem',
                  transition: 'all 0.2s',
                  cursor: canComplete ? 'pointer' : 'not-allowed',
                  transform: 'none'
                }}
              >
                {canComplete ? <Check size={24} strokeWidth={3} /> : <Lock size={20} />}
                Mark as Complete
              </button>
              
              {!canComplete && disabledReason && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#991B1B',
                  backgroundColor: '#FEF2F2',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  border: '1px solid #FECACA'
                }}>
                  <AlertCircle size={16} />
                  {disabledReason}
                </div>
              )}
            </div>
          )}

          {challenge.isCompleted && !challenge.is_free_space && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                disabled={!canComplete}
                onClick={() => onComplete(challenge)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  backgroundColor: canComplete ? 'var(--color-secondary)' : '#D1D5DB',
                  color: 'var(--color-white)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  marginTop: '1rem',
                  transition: 'all 0.2s',
                  cursor: canComplete ? 'pointer' : 'not-allowed'
                }}
              >
                {canComplete ? <X size={24} /> : <Lock size={20} />}
                Mark as Incomplete
              </button>

              {!canComplete && disabledReason && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#991B1B',
                  backgroundColor: '#FEF2F2',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: '500',
                  border: '1px solid #FECACA'
                }}>
                  <AlertCircle size={16} />
                  {disabledReason}
                </div>
              )}
            </div>
          )}

          {challenge.isCompleted && challenge.is_free_space && (
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
              Free Space!
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ChallengeModal;
