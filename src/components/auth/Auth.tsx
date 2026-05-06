import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Trophy, Gamepad2, User, PlusCircle, Settings, Lock } from 'lucide-react';
import { GameForm } from '../bingo/GameForm';
import type { Game, Challenge } from '../../types/game';

interface AuthProps {
  onLogin: (teamId: string) => void;
  onAdminLogin: (gameId: string) => void;
}

type AuthView = 'login' | 'signup' | 'create-game' | 'edit-auth' | 'game-success';

export const Auth: React.FC<AuthProps> = ({ onLogin, onAdminLogin }) => {
  const [view, setView] = useState<AuthView>('login');
  const [loading, setLoading] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [teamCode, setTeamCode] = useState('');
  const [adminPasscode, setAdminPasscode] = useState('');
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [editingChallenges, setEditingChallenges] = useState<Challenge[]>([]);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string, code?: string } | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // 1. Find the game
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('id, stopped_at, started_at')
        .eq('game_code', gameCode.toUpperCase())
        .single();

      if (gameError || !game) {
        throw new Error('Invalid Game ID. Please check and try again.');
      }

      if (view === 'signup') {
        if (game.stopped_at) {
          throw new Error('This game has already ended. No more teams can be added.');
        }
        if (game.started_at) {
          throw new Error('This game has already started. No more teams can join.');
        }
        const trimmedName = teamName.trim();
        if (!trimmedName) throw new Error('Please enter a team name.');

        // 2. Check if team name already exists for this game (case-insensitive)
        const { data: existingTeam, error: checkError } = await supabase
          .from('teams')
          .select('id')
          .eq('game_id', game.id)
          .ilike('name', trimmedName)
          .maybeSingle();

        if (existingTeam) {
          throw new Error(`A team named "${trimmedName}" already exists in this game. Please choose a different name.`);
        }

        if (checkError) throw checkError;

        // 3. Create Team
        const { data: newTeam, error: createError } = await supabase
          .from('teams')
          .insert({ 
            game_id: game.id, 
            name: trimmedName 
          })
          .select()
          .single();
        
        if (createError) throw createError;

        setMessage({ 
          type: 'success', 
          text: 'Registration successful! Please REMEMBER this ID. You will need it to log back in.',
          code: newTeam.team_code 
        });
      } else {
        // 4. Login with Team Code
        const { data: team, error: loginError } = await supabase
          .from('teams')
          .select('id, team_code')
          .eq('game_id', game.id)
          .eq('team_code', teamCode.toUpperCase())
          .single();

        if (loginError || !team) {
          throw new Error('Invalid Team ID for this game.');
        }

        onLogin(team.id);
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data: game, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('game_code', gameCode.toUpperCase())
        .single();

      if (gameError || !game) {
        throw new Error('Invalid Game ID.');
      }

      if (game.admin_passcode !== adminPasscode) {
        throw new Error('Invalid Admin Passcode.');
      }

      onAdminLogin(game.id);
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An error occurred.' });
    } finally {
      setLoading(false);
    }
  };

  const handleGameSuccess = (newGameCode: string) => {
    setView('game-success');
    setGameCode(newGameCode);
    setMessage({
      type: 'success',
      text: `Game ${editingGame ? 'updated' : 'created'} successfully! Please REMEMBER your Game ID and Admin Passcode.`,
      code: newGameCode
    });
    setEditingGame(null);
    setEditingChallenges([]);
  };

  const inputStyle = {
    appearance: 'none' as const,
    borderRadius: 'var(--radius-sm)',
    position: 'relative' as const,
    display: 'block',
    width: '100%',
    padding: '0.75rem 0.75rem 0.75rem 2.5rem',
    border: '1px solid #D1D5DB',
    backgroundColor: 'var(--color-white)',
    color: 'var(--color-text)',
    fontSize: '0.875rem',
    outline: 'none',
  };

  const iconContainerStyle = {
    position: 'absolute' as const,
    top: 0,
    bottom: 0,
    left: 0,
    paddingLeft: '0.75rem',
    display: 'flex',
    alignItems: 'center',
    pointerEvents: 'none' as const,
    zIndex: 10,
  };

  if (view === 'create-game') {
    return (
      <GameForm 
        existingGame={editingGame || undefined}
        existingChallenges={editingChallenges.length > 0 ? editingChallenges : undefined}
        isReadOnly={isReadOnly}
        onClose={() => {
          setView('login');
          setEditingGame(null);
          setEditingChallenges([]);
          setIsReadOnly(false);
        }}
        onSuccess={handleGameSuccess}
      />
    );
  }

  const isRegSuccess = view === 'signup' && message?.type === 'success';
  const isGameSuccess = view === 'game-success';
  const isAnySuccess = isRegSuccess || isGameSuccess;

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-bg)',
      padding: '1rem'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        backgroundColor: 'var(--color-white)',
        padding: '2rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      }} className="fun-shadow">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ 
            fontSize: '1.875rem', 
            fontWeight: '800', 
            color: 'var(--color-secondary)',
            marginBottom: '0.5rem'
          }}>
            {isGameSuccess ? 'Game Ready!' : (view === 'signup' ? 'Register Team' : (view === 'edit-auth' ? 'Admin Login' : 'Bingo Login'))}
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#4B5563' }}>
            {isRegSuccess 
              ? 'Save your Team ID below and use it to login.' 
              : (isGameSuccess 
                  ? 'Your game is live! Share this Game ID with your players.'
                  : (view === 'signup' 
                      ? 'Enter a name to get your Team ID.' 
                      : (view === 'edit-auth' ? 'Enter Game ID and Admin Passcode' : 'Login to an existing bingo game')))}
          </p>
        </div>

        <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} onSubmit={view === 'edit-auth' ? handleEditAuth : handleAuth}>
          {!isAnySuccess && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ position: 'relative' }}>
                <div style={iconContainerStyle}>
                  <Gamepad2 size={20} color="#9CA3AF" />
                </div>
                <input
                  type="text"
                  required
                  style={{ ...inputStyle}}
                  placeholder="Game ID"
                  value={gameCode}
                  onChange={(e) => setGameCode(e.target.value)}
                />
              </div>

              {view === 'edit-auth' && (
                <div style={{ position: 'relative' }}>
                  <div style={iconContainerStyle}>
                    <Lock size={20} color="#9CA3AF" />
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    style={inputStyle}
                    placeholder="Admin Passcode"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              )}

              {view === 'login' && (
                <div style={{ position: 'relative' }}>
                  <div style={iconContainerStyle}>
                    <User size={20} color="#9CA3AF" />
                  </div>
                  <input
                    type="text"
                    required
                    style={{ ...inputStyle}}
                    placeholder="Team ID"
                    value={teamCode}
                    onChange={(e) => setTeamCode(e.target.value)}
                  />
                </div>
              )}

              {view === 'signup' && (
                <div style={{ position: 'relative' }}>
                  <div style={iconContainerStyle}>
                    <Trophy size={20} color="#9CA3AF" />
                  </div>
                  <input
                    type="text"
                    required
                    style={inputStyle}
                    placeholder="Team Name"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {message && (
            <div style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.875rem',
              backgroundColor: message.type === 'success' ? '#ECFDF5' : (message.type === 'error' ? '#FEF2F2' : '#EFF6FF'),
              color: message.type === 'success' ? '#065F46' : (message.type === 'error' ? '#991B1B' : '#1E40AF'),
              border: `1px solid ${message.type === 'success' ? '#A7F3D0' : (message.type === 'error' ? '#FECACA' : '#BFDBFE')}`
            }}>
              {message.text}
              {message.code && (
                <div style={{ 
                  marginTop: '0.75rem', 
                  padding: '0.5rem',
                  fontSize: '1.5rem', 
                  fontWeight: '800', 
                  letterSpacing: '0.15em',
                  textAlign: 'center',
                  backgroundColor: 'white',
                  borderRadius: 'var(--radius-sm)',
                  border: '2px dashed var(--color-primary)'
                }}>
                  {message.code}
                </div>
              )}
            </div>
          )}

          {isAnySuccess ? (
            <button
              type="button"
              onClick={() => {
                setView('login');
                setMessage(null);
                setTeamName('');
                setAdminPasscode('');
              }}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-secondary)',
                color: 'var(--color-white)',
                fontSize: '0.875rem',
                fontWeight: '600',
              }}
            >
              Back to Login
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-white)',
                fontSize: '0.875rem',
                fontWeight: '600',
                transition: 'opacity 0.2s',
                opacity: loading ? 0.5 : 1
              }}
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                view === 'signup' ? 'Get Team ID' : 'Login'
              )}
            </button>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
            {!isAnySuccess && (
              <button
                type="button"
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-accent)',
                  fontWeight: '500',
                  backgroundColor: 'transparent'
                }}
                onClick={() => {
                  setView(view === 'login' ? 'signup' : 'login');
                  setMessage(null);
                }}
              >
                {view === 'login' ? 'New to the game? Register your team' : 'Return to game login'}
              </button>
            )}

            {!isAnySuccess && (
              <>
                <div style={{ 
                  width: '100%', 
                  height: '1px', 
                  backgroundColor: '#E5E7EB', 
                  margin: '0.5rem 0' 
                }} />

                <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                  <button
                    type="button"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#4B5563',
                      backgroundColor: '#F3F4F6',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: '600'
                    }}
                    onClick={() => setView('edit-auth')}
                  >
                    <Settings size={16} />
                    Game Admin
                  </button>

                  <button
                    type="button"
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#4B5563',
                      backgroundColor: '#F3F4F6',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: '600'
                    }}
                    onClick={() => setView('create-game')}
                  >
                    <PlusCircle size={16} />
                    Create Game
                  </button>
                </div>
              </>
            )}
          </div>
        </form>
      </div>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};
