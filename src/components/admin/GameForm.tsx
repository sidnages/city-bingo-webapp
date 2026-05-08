import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Save, X, Info, Edit3, Lock } from 'lucide-react';
import type { Game, Challenge } from '../../types/game';

interface GameFormProps {
  existingGame?: Game;
  existingChallenges?: Challenge[];
  isReadOnly?: boolean;
  onClose: () => void;
  onSuccess: (gameCode: string) => void;
}

export const GameForm: React.FC<GameFormProps> = ({ existingGame, existingChallenges, isReadOnly, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameName, setGameName] = useState(existingGame?.name || '');
  const [durationMinutes, setDurationMinutes] = useState(existingGame ? Math.floor(existingGame.duration_seconds / 60) : 120);
  const [gameRules, setGameRules] = useState(existingGame?.game_rules || '');
  const [pointsPerSquare, setPointsPerSquare] = useState(existingGame?.points_per_square || 1);
  const [pointsPerBingo, setPointsPerBingo] = useState(existingGame?.points_per_bingo || 2);
  const [pointsPerUnique, setPointsPerUnique] = useState(existingGame?.points_per_unique || 2);
  const [adminPasscode, setAdminPasscode] = useState(existingGame?.admin_passcode || '');
  const [hasFreeSpace, setHasFreeSpace] = useState(existingChallenges ? existingChallenges.some(c => c.is_free_space) : true);
  const [requireInstagram, setRequireInstagram] = useState(existingGame?.require_instagram || false);
  const [editingChallengeIndex, setEditingChallengeIndex] = useState<number | null>(null);
  const [challenges, setChallenges] = useState<{title: string, description: string, position: number, is_free_space: boolean}[]>(() => {
    if (existingChallenges && existingChallenges.length > 0) {
      const sorted = [...existingChallenges].sort((a, b) => a.position - b.position);
      return sorted.map(c => ({
        title: c.title,
        description: c.description,
        position: c.position,
        is_free_space: c.is_free_space
      }));
    }
    
    return Array.from({ length: 25 }, (_, i) => ({
      title: i === 12 ? 'FREE SPACE' : '',
      description: i === 12 ? 'Enjoy the game!' : '',
      position: i,
      is_free_space: i === 12
    }));
  });

  useEffect(() => {
    if (isReadOnly) return;
    setChallenges(prev => {
      const newChallenges = [...prev];
      if (hasFreeSpace) {
        newChallenges[12] = {
          title: 'FREE SPACE',
          description: 'Enjoy the game!',
          position: 12,
          is_free_space: true
        };
      } else if (newChallenges[12].is_free_space) {
        newChallenges[12] = {
          ...newChallenges[12],
          is_free_space: false,
          title: newChallenges[12].title === 'FREE SPACE' ? '' : newChallenges[12].title,
          description: newChallenges[12].description === 'Enjoy the game!' ? '' : newChallenges[12].description
        };
      }
      return newChallenges;
    });
  }, [hasFreeSpace, isReadOnly]);

  const handleChallengeChange = (index: number, field: 'title' | 'description', value: string) => {
    if (isReadOnly) return;
    const newChallenges = [...challenges];
    newChallenges[index] = { ...newChallenges[index], [field]: value };
    setChallenges(newChallenges);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    
    setLoading(true);
    setError(null);

    if (adminPasscode.length !== 4 || !/^\d+$/.test(adminPasscode)) {
      setError('Admin passcode must be 4 digits.');
      setLoading(false);
      return;
    }

    const missingTitles = challenges
      .map((c, i) => (!c.is_free_space && !c.title.trim()) ? i + 1 : null)
      .filter((n): n is number => n !== null);

    if (missingTitles.length > 0) {
      setError(`Missing titles for Square(s): ${missingTitles.join(', ')}`);
      setLoading(false);
      return;
    }

    // Security gate for game creation, performed after basic validation
    if (!existingGame) {
      const secret = prompt('Please enter the game creation secret:');
      if (secret !== import.meta.env.VITE_GAME_CREATION_SECRET) {
        alert('Invalid game creation secret.');
        setLoading(false);
        return;
      }
    }

    try {
      let gameId = existingGame?.id;
      let gameCode = existingGame?.game_code;

      if (existingGame) {
        const { error: gameError } = await supabase
          .from('games')
          .update({
            name: gameName,
            duration_seconds: durationMinutes * 60,
            admin_passcode: adminPasscode,
            points_per_square: pointsPerSquare,
            points_per_bingo: pointsPerBingo,
            points_per_unique: pointsPerUnique,
            game_rules: gameRules,
            require_instagram: requireInstagram
          })
          .eq('id', existingGame.id);

        if (gameError) throw gameError;

        const { error: deleteError } = await supabase
          .from('challenges')
          .delete()
          .eq('game_id', existingGame.id);
        
        if (deleteError) throw deleteError;
      } else {
        const { data: newGame, error: gameError } = await supabase
          .from('games')
          .insert({
            name: gameName,
            duration_seconds: durationMinutes * 60,
            admin_passcode: adminPasscode,
            points_per_square: pointsPerSquare,
            points_per_bingo: pointsPerBingo,
            points_per_unique: pointsPerUnique,
            game_rules: gameRules,
            require_instagram: requireInstagram
          })
          .select()
          .single();

        if (gameError) throw gameError;
        gameId = newGame.id;
        gameCode = newGame.game_code;
      }

      const challengesToInsert = challenges.map(c => ({
        ...c,
        game_id: gameId
      }));

      const { error: challengesError } = await supabase
        .from('challenges')
        .insert(challengesToInsert);

      if (challengesError) throw challengesError;

      onSuccess(gameCode!);
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid #D1D5DB',
    fontSize: '0.875rem',
    backgroundColor: isReadOnly ? '#F9FAFB' : 'white',
    cursor: isReadOnly ? 'not-allowed' : 'text'
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        backgroundColor: 'var(--color-white)',
        width: '100%',
        maxWidth: '900px',
        maxHeight: '95vh',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: isReadOnly ? '#4B5563' : 'var(--color-primary)',
          color: 'white'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {isReadOnly && <Lock size={20} />}
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800' }}>
                {isReadOnly ? 'View Game (Locked)' : (existingGame ? 'Edit Game' : 'Create New Game')}
              </h2>
              <p style={{ fontSize: '0.75rem', opacity: 0.9, marginTop: '2px' }}>
                {isReadOnly ? 'This game has started and cannot be modified' : 'Configure your bingo board and game settings'}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', color: 'white', padding: '0.5rem', borderRadius: '50%' }}>
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
          <div style={{ padding: '1.5rem', overflowY: 'auto', flex: 1, backgroundColor: 'var(--color-bg)' }}>
            {isReadOnly && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#EFF6FF',
                color: '#1E40AF',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <Info size={20} />
                <p><strong>Game Locked:</strong> Teams have already started their runs. To prevent unfair advantages, game settings and challenges are now read-only.</p>
              </div>
            )}

            {error && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#FEF2F2',
                color: '#991B1B',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1.5rem',
                fontSize: '0.875rem',
                border: '1px solid #FECACA',
                fontWeight: '500'
              }}>
                {error}
              </div>
            )}

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: 'var(--radius-md)', 
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '2rem'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem', color: isReadOnly ? '#4B5563' : 'var(--color-secondary)' }}>Game Settings</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#6B7280', marginBottom: '0.5rem' }}>Game Name</label>
                  <input
                    type="text"
                    required
                    readOnly={isReadOnly}
                    style={inputStyle}
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    placeholder="e.g. Downtown Dash"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#6B7280', marginBottom: '0.5rem' }}>Time Limit (min)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    readOnly={isReadOnly}
                    style={inputStyle}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#6B7280', marginBottom: '0.5rem' }}>Admin Passcode (4 digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    readOnly={isReadOnly}
                    style={inputStyle}
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value.replace(/\D/g, ''))}
                    placeholder="1234"
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#6B7280', marginBottom: '0.5rem' }}>Game Rules (Optional)</label>
                <textarea
                  readOnly={isReadOnly}
                  style={{ ...inputStyle, minHeight: '80px' }}
                  value={gameRules}
                  onChange={(e) => setGameRules(e.target.value)}
                  placeholder="Additional rules or instructions for teams..."
                />
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="checkbox"
                    id="hasFreeSpace"
                    disabled={isReadOnly}
                    style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--color-primary)' }}
                    checked={hasFreeSpace}
                    onChange={(e) => setHasFreeSpace(e.target.checked)}
                  />
                  <label htmlFor="hasFreeSpace" style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text)' }}>
                    Include a FREE SPACE in the center (recommended)
                  </label>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="checkbox"
                    id="requireInstagram"
                    disabled={isReadOnly}
                    style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--color-primary)' }}
                    checked={requireInstagram}
                    onChange={(e) => setRequireInstagram(e.target.checked)}
                  />
                  <label htmlFor="requireInstagram" style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--color-text)' }}>
                    Require Instagram post URL for challenge completion
                  </label>
                </div>
              </div>
            </div>

            <div style={{ 
              backgroundColor: 'white', 
              padding: '1.5rem', 
              borderRadius: 'var(--radius-md)', 
              boxShadow: 'var(--shadow-sm)',
              marginBottom: '2rem'
            }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1.25rem', color: isReadOnly ? '#4B5563' : 'var(--color-secondary)' }}>Scoring Settings</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#6B7280', marginBottom: '0.5rem' }}>Pts/Square</label>
                  <input
                    type="number"
                    required
                    min="0"
                    readOnly={isReadOnly}
                    style={inputStyle}
                    value={pointsPerSquare}
                    onChange={(e) => setPointsPerSquare(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#6B7280', marginBottom: '0.5rem' }}>Pts/Bingo</label>
                  <input
                    type="number"
                    required
                    min="0"
                    readOnly={isReadOnly}
                    style={inputStyle}
                    value={pointsPerBingo}
                    onChange={(e) => setPointsPerBingo(parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#6B7280', marginBottom: '0.5rem' }}>Pts/Unique</label>
                  <input
                    type="number"
                    required
                    min="0"
                    readOnly={isReadOnly}
                    style={inputStyle}
                    value={pointsPerUnique}
                    onChange={(e) => setPointsPerUnique(parseInt(e.target.value))}
                  />
                </div>
              </div>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: '800', color: isReadOnly ? '#4B5563' : 'var(--color-secondary)', marginBottom: '0.5rem' }}>The Bingo Board</h3>
              <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                {isReadOnly ? 'Click any square to view its challenge details.' : 'Click any square to edit its challenge details.'}
              </p>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '0.5rem',
              maxWidth: '600px',
              margin: '0 auto',
              backgroundColor: 'var(--color-bg-dark)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-md)'
            }}>
              {challenges.map((challenge, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setEditingChallengeIndex(i)}
                  style={{
                    aspectRatio: '1/1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.25rem',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: challenge.is_free_space ? '#F9FAFB' : (challenge.title ? 'white' : '#FFF7ED'),
                    color: 'var(--color-text)',
                    fontSize: '0.65rem',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    position: 'relative',
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
                    opacity: challenge.is_free_space ? 0.9 : 1
                  }}
                  className="card-square-preview"
                >
                  {challenge.is_free_space ? (
                    <span style={{ color: isReadOnly ? '#4B5563' : 'var(--color-primary)' }}>FREE</span>
                  ) : (
                    <>
                      <div style={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical' 
                      }}>
                        {challenge.title || `Square ${i + 1}`}
                      </div>
                      {!challenge.title && <PlusCircleSmall />}
                    </>
                  )}
                  <div className="edit-indicator" style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    opacity: 0.3
                  }}>
                    {isReadOnly ? <Info size={10} /> : <Edit3 size={10} />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ 
            padding: '1.25rem 1.5rem', 
            borderTop: '1px solid #E5E7EB', 
            display: 'flex', 
            justifyContent: 'flex-end', 
            gap: '1rem',
            backgroundColor: 'white'
          }}>
            {!isReadOnly && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'transparent',
                  color: '#6B7280',
                  fontWeight: '700',
                  border: '2px solid #E5E7EB'
                }}
              >
                Discard
              </button>
            )}
            <button
              type={isReadOnly ? "button" : "submit"}
              onClick={isReadOnly ? onClose : undefined}
              disabled={loading}
              style={{
                padding: '0.75rem 2rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: isReadOnly ? '#4B5563' : 'var(--color-secondary)',
                color: 'white',
                fontWeight: '800',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (isReadOnly ? <X size={20} /> : <Save size={20} />)}
              {isReadOnly ? 'Close View' : (existingGame ? 'Save Changes' : 'Launch Game')}
            </button>
          </div>
        </form>

        {editingChallengeIndex !== null && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: 'white',
              width: '100%',
              maxWidth: '400px',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h4 style={{ fontWeight: '800', color: isReadOnly ? '#4B5563' : 'var(--color-primary)' }}>
                  Square {editingChallengeIndex + 1} Challenge
                </h4>
                {challenges[editingChallengeIndex].is_free_space && <span style={{ fontSize: '0.7rem', backgroundColor: '#F3F4F6', padding: '2px 6px', borderRadius: '4px' }}>Free Space</span>}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#6B7280', marginBottom: '0.4rem' }}>Challenge Title</label>
                  <input
                    type="text"
                    required
                    readOnly={isReadOnly || challenges[editingChallengeIndex].is_free_space}
                    style={{...inputStyle, backgroundColor: (isReadOnly || challenges[editingChallengeIndex].is_free_space) ? '#F9FAFB' : 'white'}}
                    value={challenges[editingChallengeIndex].title}
                    onChange={(e) => handleChallengeChange(editingChallengeIndex, 'title', e.target.value)}
                    placeholder="Short & punchy title"
                    autoFocus
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '700', color: '#6B7280', marginBottom: '0.4rem' }}>Description</label>
                  <textarea
                    readOnly={isReadOnly || challenges[editingChallengeIndex].is_free_space}
                    style={{ ...inputStyle, minHeight: '100px', resize: 'none', backgroundColor: (isReadOnly || challenges[editingChallengeIndex].is_free_space) ? '#F9FAFB' : 'white' }}
                    value={challenges[editingChallengeIndex].description}
                    onChange={(e) => handleChallengeChange(editingChallengeIndex, 'description', e.target.value)}
                    placeholder="Explain what the team needs to do..."
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setEditingChallengeIndex(null)}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    backgroundColor: isReadOnly ? '#4B5563' : 'var(--color-primary)',
                    color: 'white',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '800'
                  }}
                >
                  {isReadOnly ? 'Close' : 'Done'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
        .card-square-preview:hover {
          transform: scale(1.05);
          z-index: 10;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          background-color: white !important;
        }
        .card-square-preview:hover .edit-indicator {
          opacity: 1 !important;
          color: var(--color-primary);
        }
      `}</style>
    </div>
  );
};

const PlusCircleSmall = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: '2px' }}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);
