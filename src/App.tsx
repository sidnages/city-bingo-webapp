import { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/layout/Header';
import BingoCard from './components/bingo/BingoCard';
import ChallengeModal from './components/bingo/ChallengeModal';
import Timer from './components/sidebar/Timer';
import Leaderboard from './components/sidebar/Leaderboard';
import { Auth } from './components/auth/Auth';
import { BingoCelebration } from './components/bingo/BingoCelebration';
import { AdminDashboard } from './components/bingo/AdminDashboard';
import ScoringModal from './components/bingo/ScoringModal';
import { supabase } from './lib/supabase';
import { Settings, Gamepad2, Info } from 'lucide-react';
import { calculateTeamScore } from './lib/scoring';
import type { Challenge, Team, Game } from './types/game';

function App() {
  const [teamId, setTeamId] = useState<string | null>(localStorage.getItem('teamId'));
  const [adminGameId, setAdminGameId] = useState<string | null>(localStorage.getItem('adminGameId'));
  const [activeView, setActiveView] = useState<'team' | 'admin'>(adminGameId && !teamId ? 'admin' : 'team');
  
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBingoEffect, setShowBingoEffect] = useState(false);
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [bingoCount, setBingoCount] = useState(0);
  const isInitialLoad = useRef(true);

  // 1. Fetch Game and Team Data
  const fetchData = useCallback(async () => {
    if (!teamId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch Current Team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (teamError) {
        if (teamError.code === 'PGRST116') {
          localStorage.removeItem('teamId');
          setTeamId(null);
          return;
        }
        throw teamError;
      }
      setCurrentTeam(teamData);

      // Fetch Game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', teamData.game_id)
        .single();
      
      if (gameError) throw gameError;
      setGame(gameData);

      // Fetch Challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .eq('game_id', teamData.game_id)
        .order('position', { ascending: true });

      if (challengesError) throw challengesError;

      // Fetch All Teams for this game
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('game_id', teamData.game_id);

      if (teamsError) throw teamsError;

      // Fetch Progress for ALL teams in this game
      const { data: progressData, error: progressError } = await supabase
        .from('team_progress')
        .select('*, challenges!inner(game_id)')
        .eq('challenges.game_id', teamData.game_id);

      if (progressError) throw progressError;

      if (challengesData && teamsData && progressData) {
        // Ensure unique positions (safety check against DB duplication)
        const uniqueChallengesMap = new Map();
        challengesData.forEach(c => {
          if (!uniqueChallengesMap.has(c.position)) {
            uniqueChallengesMap.set(c.position, c);
          }
        });
        const filteredChallenges = Array.from(uniqueChallengesMap.values());

        const myProgress = progressData.filter((p: any) => p.team_id === teamId);
        const enrichedChallenges = filteredChallenges.map(c => ({
          ...c,
          isCompleted: myProgress.some((p: any) => p.challenge_id === c.id) || c.is_free_space
        }));
        
        setChallenges(enrichedChallenges);

        // Check for Bingo
        const bingoPatterns = [
          // Rows
          [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
          // Columns
          [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
          // Diagonals
          [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
        ];

        let currentBingoCount = 0;
        bingoPatterns.forEach(pattern => {
          if (pattern.every(pos => enrichedChallenges[pos]?.isCompleted)) {
            currentBingoCount++;
          }
        });

        setBingoCount(prev => {
          // Trigger celebration if bingo count increased and it's NOT the very first fetch of the session
          if (currentBingoCount > prev && !isInitialLoad.current) {
            setShowBingoEffect(true);
          }
          return currentBingoCount;
        });

        // Mark initial load as complete after the first check
        isInitialLoad.current = false;

        const teamsWithScores = teamsData.map(t => ({
          ...t,
          score: calculateTeamScore(t.id, progressData, filteredChallenges, teamsData.map(td => td.id), {
            square: gameData.points_per_square,
            bingo: gameData.points_per_bingo,
            unique: gameData.points_per_unique
          })
        }));
        setTeams(teamsWithScores);
      }
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'An unexpected error occurred while loading the game.');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  const handleStartRun = async () => {
    if (!teamId || !game?.started_at) return;
    try {
      const { error } = await supabase
        .from('teams')
        .update({ started_at: new Date().toISOString() })
        .eq('id', teamId);
      
      if (error) throw error;
      await fetchData();
    } catch (error: any) {
      console.error('Error starting run:', error);
      alert(`Failed to start run: ${error.message || 'Unknown error'}`);
    }
  };

  useEffect(() => {
    fetchData();

    if (teamId) {
      const channel = supabase
        .channel('schema-db-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'team_progress' }, () => fetchData())
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams' }, () => fetchData())
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'games' }, () => fetchData())
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [teamId, fetchData]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogin = (id: string) => {
    localStorage.setItem('teamId', id);
    setTeamId(id);
    setActiveView('team');
  };

  const handleAdminLogin = (id: string) => {
    localStorage.setItem('adminGameId', id);
    setAdminGameId(id);
    setActiveView('admin');
  };

  const handleSignOut = () => {
    localStorage.removeItem('teamId');
    localStorage.removeItem('adminGameId');
    setTeamId(null);
    setAdminGameId(null);
    setCurrentTeam(null);
    setGame(null);
    setActiveView('team');
  };

  const handleSquareClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const getCompletionStatus = () => {
    if (game?.stopped_at) {
      return { 
        canComplete: false, 
        disabledReason: "The game has ended. No more challenges can be completed." 
      };
    }

    if (!currentTeam?.started_at) {
      return { 
        canComplete: false, 
        disabledReason: 'Your run has not started yet.' 
      };
    }

    const startTime = new Date(currentTeam.started_at).getTime();
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const isTimeUp = elapsed >= (game?.duration_seconds || 0);

    if (isTimeUp) {
      return { 
        canComplete: false, 
        disabledReason: "Time's up! Your run has completed." 
      };
    }

    return { canComplete: true };
  };

  const { canComplete, disabledReason } = getCompletionStatus();

  const handleCompleteChallenge = async (challenge: Challenge) => {
    if (!teamId) return;
    try {
      if (challenge.isCompleted) {
        // Uncomplete: find progress record
        const { data: progress, error: fetchError } = await supabase
          .from('team_progress')
          .select('id')
          .eq('team_id', teamId)
          .eq('challenge_id', challenge.id)
          .single();
        
        if (fetchError) throw fetchError;
        
        const { error: deleteError } = await supabase
          .from('team_progress')
          .delete()
          .eq('id', progress.id);
          
        if (deleteError) throw deleteError;
      } else {
        // Complete
        const { error } = await supabase
          .from('team_progress')
          .insert([{
            team_id: teamId,
            challenge_id: challenge.id
          }]);

        if (error) throw error;
      }

      setSelectedChallenge(null);
      await fetchData(); // Refresh state
    } catch (error) {
      console.error('Error toggling challenge:', error);
    }
  };

  const FullScreenState = ({ children, isError = false }: { children: React.ReactNode, isError?: boolean }) => (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh', 
      textAlign: 'center',
      padding: '2rem',
      backgroundColor: 'var(--color-bg)'
    }}>
      <div style={{
        backgroundColor: 'var(--color-white)',
        padding: '3rem',
        borderRadius: 'var(--radius-lg)',
        border: `4px solid ${isError ? 'var(--color-secondary)' : 'var(--color-primary)'}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
        maxWidth: '500px',
        width: '100%'
      }}>
        {children}
      </div>
    </div>
  );

  if (!teamId && !adminGameId) {
    return <Auth onLogin={handleLogin} onAdminLogin={handleAdminLogin} />;
  }

  if (activeView === 'admin' && adminGameId) {
    return <AdminDashboard gameId={adminGameId} onSignOut={handleSignOut} />;
  }

  if (loading && !currentTeam) {
    return (
      <FullScreenState>
        <div style={{ 
          width: '50px', 
          height: '50px', 
          border: '5px solid var(--color-bg)', 
          borderTop: '5px solid var(--color-primary)', 
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1.5rem'
        }} />
        <h2 style={{ color: 'var(--color-primary)' }}>Loading Game...</h2>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </FullScreenState>
    );
  }

  if (error) {
    return (
      <FullScreenState isError>
        <h2 style={{ color: 'var(--color-secondary)', marginBottom: '1rem' }}>Oops!</h2>
        <p style={{ color: 'var(--color-text)', marginBottom: '2rem', lineHeight: 1.5 }}>
          {error || 'Game not found.'}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => fetchData()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-white)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 'bold'
            }}
          >
            Try Again
          </button>
          <button 
            onClick={handleSignOut}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: 'var(--color-secondary)',
              color: 'var(--color-white)',
              borderRadius: 'var(--radius-md)',
              fontWeight: 'bold'
            }}
          >
            Sign Out
          </button>
        </div>
      </FullScreenState>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      <Header teamName={currentTeam?.name || 'Loading...'} onSignOut={handleSignOut} onShowRules={() => setShowScoringModal(true)} />
      
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '2rem',
        alignItems: isMobile ? 'center' : 'flex-start'
      }}>
        <section style={{ flex: '1', width: '100%', maxWidth: '650px' }}>
          <BingoCard 
            challenges={challenges} 
            onSquareClick={handleSquareClick} 
          />
        </section>

        <aside style={{ 
          width: isMobile ? '100%' : '320px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem',
          position: isMobile ? 'static' : 'sticky',
          top: '2rem'
        }}>
          {game && currentTeam && (
            <Timer 
              startedAt={currentTeam.started_at || null} 
              durationSeconds={game.duration_seconds} 
              onStart={handleStartRun}
              gameStoppedAt={game.stopped_at || null}
              disabled={!game.started_at || !!game.stopped_at}
              disabledReason={game.stopped_at ? "The game has ended." : "The game has not been started by the admin yet."}
            />
          )}
          <Leaderboard 
            teams={teams} 
            currentTeamId={teamId || ''} 
            gameDurationSeconds={game?.duration_seconds || 0}
            gameStoppedAt={game?.stopped_at || null}
            isPublished={!!game?.published_at}
          />
        </aside>
      </main>

      <ChallengeModal 
        challenge={selectedChallenge}
        onClose={() => setSelectedChallenge(null)}
        onComplete={handleCompleteChallenge}
        canComplete={canComplete}
        disabledReason={disabledReason}
      />

      {showScoringModal && game && (
        <ScoringModal 
          onClose={() => setShowScoringModal(false)}
          points={{ 
            square: game.points_per_square, 
            bingo: game.points_per_bingo, 
            unique: game.points_per_unique,
            rules: game.game_rules
          }}
        />
      )}

      <BingoCelebration 
        show={showBingoEffect} 
        onComplete={() => setShowBingoEffect(false)} 
      />
    </div>
  );
}

export default App;
