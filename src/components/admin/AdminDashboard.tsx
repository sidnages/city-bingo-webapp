import React, { useState, useEffect } from 'react';
import { calculateTeamScore } from '../../lib/scoring';
import { supabase } from '../../lib/supabase';
import { Users, Play, Square, CheckSquare, Loader2, X, Trophy, AlertTriangle, Eye, Settings, BookOpen, Camera } from 'lucide-react';
import type { Game, Team, Challenge, TeamProgress } from '../../types/game';
import { GameForm } from './GameForm';
import ChallengeModal from '../bingo/ChallengeModal';

interface AdminDashboardProps {
  gameId: string;
  onSignOut: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ gameId, onSignOut }) => {
  const [game, setGame] = useState<Game | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [allProgress, setAllProgress] = useState<TeamProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [isEditingConfig, setIsEditingConfig] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [, setTick] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch Game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', gameId)
        .single();
      if (gameError) throw gameError;
      setGame(gameData);

      // Fetch Teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('game_id', gameId)
        .order('name', { ascending: true });
      if (teamsError) throw teamsError;

      // Fetch Challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .eq('game_id', gameId)
        .order('position', { ascending: true });
      if (challengesError) throw challengesError;
      const challenges = challengesData || [];
      setChallenges(challenges);

      // Fetch All Progress
      const { data: progressData, error: progressError } = await supabase
        .from('team_progress')
        .select('*, challenges!inner(game_id)')
        .eq('challenges.game_id', gameId);
      if (progressError) throw progressError;
      setAllProgress(progressData || []);

      const enrichedTeams = teamsData.map(t => ({
        ...t,
        score: calculateTeamScore(t.id, progressData || [], challenges, {
          square: gameData.points_per_square,
          bingo: gameData.points_per_bingo,
          unique: gameData.points_per_unique
        })
      }));
      setTeams(enrichedTeams);

    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const progressChannel = supabase
      .channel('admin-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'team_progress' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => fetchData())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games', filter: `id=eq.${gameId}` }, (payload) => {
        setGame(payload.new as Game);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(progressChannel);
    };
  }, [gameId]);

  // Re-render every second to update team timers
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  if (isEditingConfig && game) {
    return (
      <GameForm 
        existingGame={game}
        existingChallenges={challenges.length > 0 ? challenges : undefined}
        isReadOnly={!!game.started_at}
        onClose={() => setIsEditingConfig(false)}
        onSuccess={() => {
          setIsEditingConfig(false);
          fetchData();
        }}
      />
    );
  }

  const handleStartGame = async () => {
    if (!window.confirm('Are you sure you want to START the game? This will lock the board configuration for all teams.')) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('games')
        .update({ started_at: new Date().toISOString() })
        .eq('id', gameId);
      if (error) throw error;
      
      // Manually refresh game state
      await fetchData();
    } catch (error) {
      console.error('Error starting game:', error);
      alert('Failed to start game. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopGame = async () => {
    if (!window.confirm('Are you sure you want to STOP the game? This will mark all team runs as completed and allow you to make any modifications to team progress before publishing scores.')) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('games')
        .update({ stopped_at: new Date().toISOString() })
        .eq('id', gameId);
      if (error) throw error;
      
      // Refresh state
      await fetchData();
    } catch (error) {
      console.error('Error stopping game:', error);
      alert('Failed to stop game. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishScores = async () => {
    if (!window.confirm('Are you sure you want to PUBLISH scores? This action is final and will lock all results for the public.')) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('games')
        .update({ published_at: new Date().toISOString() })
        .eq('id', gameId);
      if (error) throw error;
      
      // Refresh state
      await fetchData();
    } catch (error) {
      console.error('Error publishing scores:', error);
      alert('Failed to publish scores.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveTeam = async (teamId: string) => {
    if (!window.confirm('Are you sure you want to remove this team? This action cannot be undone.')) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);
      if (error) throw error;
      setSelectedTeam(null);
      await fetchData();
    } catch (error) {
      console.error('Error removing team:', error);
      alert('Failed to remove team.');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleChallenge = async (teamId: string, challengeId: string, isCompleted: boolean, instagramUrl?: string) => {
    if (game?.published_at) {
      alert('You cannot modify progress after scores have been published.');
      return;
    }
    if (!game?.stopped_at) {
      alert('You can only modify progress after the game has finished.');
      return;
    }

    const action = isCompleted ? 'mark this challenge as incomplete' : 'mark this challenge as complete';
    if (!window.confirm(`Are you sure you want to ${action}?`)) return;

    try {
      if (isCompleted) {
        // Uncomplete
        const progress = allProgress.find(p => p.team_id === teamId && p.challenge_id === challengeId);
        if (progress) {
          const { error } = await supabase
            .from('team_progress')
            .delete()
            .eq('id', progress.id);
          if (error) throw error;
        }
      } else {
        // Complete
        const { error } = await supabase
          .from('team_progress')
          .insert([{ 
            team_id: teamId, 
            challenge_id: challengeId,
            instagram_url: instagramUrl 
          }]);
        if (error) throw error;
      }

      // Refresh data to update UI
      await fetchData();
    } catch (error: any) {
      console.error('Error toggling challenge:', error);
      alert(`Error toggling challenge: ${error.message || 'Unknown error'}`);
    }
  };

  const handleSquareClick = (challenge: Challenge) => {
    if (!selectedTeam) return;
    const progress = allProgress.find(p => p.team_id === selectedTeam.id && p.challenge_id === challenge.id);
    setSelectedChallenge({
      ...challenge,
      isCompleted: !!progress || challenge.is_free_space,
      instagramUrl: progress?.instagram_url
    });
  };

  // Helper to format remaining time
  const getRemainingTime = (team: Team) => {
    if (!team.started_at || game?.stopped_at) return 'Time Up';
    
    const startTime = new Date(team.started_at).getTime();
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, (game?.duration_seconds || 0) - elapsed);
    
    if (remaining === 0) return 'Time Up';
    
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading && !game) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <Loader2 className="animate-spin" size={48} color="var(--color-primary)" />
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--color-secondary)' }}>Admin Dashboard</h1>
          <p style={{ color: '#6B7280' }}>Managing: <strong>{game?.name}</strong> ({game?.game_code})</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          {!game?.started_at ? (
            <button
              onClick={handleStartGame}
              disabled={actionLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                fontWeight: 'bold',
                opacity: actionLoading ? 0.7 : 1
              }}
            >
              {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
              START GAME
            </button>
          ) : !game?.stopped_at ? (
            <button
              onClick={handleStopGame}
              disabled={actionLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--color-secondary)',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                fontWeight: 'bold',
                opacity: actionLoading ? 0.7 : 1
              }}
            >
              {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <Square size={20} />}
              STOP GAME
            </button>
          ) : !game?.published_at ? (
            <button
              onClick={handlePublishScores}
              disabled={actionLoading}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.5rem',
                backgroundColor: 'var(--color-secondary)',
                color: 'white',
                borderRadius: 'var(--radius-md)',
                fontWeight: 'bold',
                opacity: actionLoading ? 0.7 : 1
              }}
            >
              {actionLoading ? <Loader2 className="animate-spin" size={20} /> : <Trophy size={20} />}
              PUBLISH SCORES
            </button>
          ) : (
            <div style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#F3F4F6',
              color: '#4B5563',
              borderRadius: 'var(--radius-md)',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertTriangle size={20} />
              SCORES PUBLISHED
            </div>
          )}
          <button
            onClick={() => setIsEditingConfig(true)}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'white',
              color: 'var(--color-text)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 'bold',
              border: '1px solid #E5E7EB',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {game?.started_at ? <BookOpen size={20} /> : <Settings size={20} />}
            {game?.started_at ? 'View Config' : 'Edit Config'}
          </button>
          <button
            onClick={onSignOut}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'white',
              color: '#6B7280',
              borderRadius: 'var(--radius-md)',
              fontWeight: 'bold',
              border: '1px solid #E5E7EB'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {game?.started_at && !game?.stopped_at && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#FFF7ED',
          border: '1px solid #FFEDD5',
          borderRadius: 'var(--radius-md)',
          color: '#9A3412',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertTriangle size={20} />
          <p><strong>Game in Progress:</strong> Board configuration is now locked for all teams.</p>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '1.5rem' 
      }}>
        <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem', borderBottom: '1px solid #F3F4F6', backgroundColor: '#F9FAFB', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Users size={20} color="var(--color-primary)" />
            <h2 style={{ fontWeight: '800', fontSize: '1.1rem' }}>Teams ({teams.length})</h2>
          </div>
          <div style={{ overflowY: 'auto', maxHeight: '600px' }}>
            {teams.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
                No teams registered yet.
              </div>
            ) : (
              teams.map(team => (
                <button
                  key={team.id}
                  onClick={() => setSelectedTeam(team)}
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #F3F4F6',
                    backgroundColor: selectedTeam?.id === team.id ? '#EFF6FF' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      backgroundColor: 'var(--color-bg)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'var(--color-primary)',
                      fontWeight: 'bold'
                    }}>
                      {team.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: 'var(--color-text)' }}>{team.name}</div>
                      <div style={{ fontSize: '0.75rem', color: getRemainingTime(team) === 'Time Up' ? '#DC2626' : '#6B7280' }}>
                        {team.started_at ? getRemainingTime(team) : 'Not started'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      backgroundColor: 'var(--color-secondary)', 
                      color: 'white', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      {team.score} pts
                    </div>
                    <Eye size={18} color="#9CA3AF" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {selectedTeam ? (
          <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-primary)' }}>{selectedTeam.name}'s Card</h3>
                <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Click a square to view/manage challenge</p>
              </div>
              <button 
                onClick={() => setSelectedTeam(null)}
                style={{ padding: '0.5rem', borderRadius: '50%', backgroundColor: '#F3F4F6' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(5, 1fr)', 
              gap: '0.4rem',
              backgroundColor: 'var(--color-bg-dark)',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              width: '100%',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}>
              {challenges.map(challenge => {
                const progress = allProgress.find(p => p.team_id === selectedTeam.id && p.challenge_id === challenge.id);
                const isCompleted = !!progress || challenge.is_free_space;
                return (
                  <button
                    key={challenge.id}
                    onClick={() => handleSquareClick(challenge)}
                    style={{
                      aspectRatio: '1/1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.2rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isCompleted ? 'var(--color-primary)' : 'white',
                      color: isCompleted ? 'white' : 'var(--color-text)',
                      fontSize: '0.6rem',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)',
                      overflow: 'hidden'
                    }}
                  >
                    {challenge.is_free_space ? (
                      'FREE'
                    ) : (
                      <>
                        <div style={{ 
                          width: '100%',
                          wordBreak: 'break-word',
                          display: '-webkit-box', 
                          WebkitLineClamp: 3, 
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {challenge.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                          {isCompleted ? <CheckSquare size={12} style={{ flexShrink: 0 }} /> : <Square size={12} style={{ opacity: 0.3, flexShrink: 0 }} />}
                          {progress?.instagram_url && (
                            <Camera size={10} style={{ color: 'white' }} />
                          )}
                        </div>
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {!game?.started_at && (
              <button
                onClick={() => handleRemoveTeam(selectedTeam.id)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: '#FEE2E2',
                  color: '#B91C1C',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 'bold',
                  border: '1px solid #FECACA',
                  marginTop: '0.5rem'
                }}
              >
                Remove Team
              </button>
            )}
          </div>
        ) : (
          <div style={{ 
            backgroundColor: '#F9FAFB', 
            borderRadius: 'var(--radius-lg)', 
            border: '2px dashed #E5E7EB',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '3rem',
            textAlign: 'center',
            color: '#9CA3AF'
          }}>
            <Trophy size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ fontWeight: '600' }}>Select a team to view their bingo card and manage their progress.</p>
          </div>
        )}
      </div>

      {selectedChallenge && selectedTeam && (
        <ChallengeModal 
          challenge={selectedChallenge}
          onClose={() => setSelectedChallenge(null)}
          onComplete={(_challenge, instagramUrl) => {
            toggleChallenge(selectedTeam.id, selectedChallenge.id, !!selectedChallenge.isCompleted, instagramUrl);
            setSelectedChallenge(null);
          }}
          canComplete={!!game?.stopped_at && !game?.published_at}
          disabledReason={game?.published_at ? "Scores are published." : "Game is still in progress."}
          requireInstagram={game?.require_instagram}
        />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .animate-spin { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};
