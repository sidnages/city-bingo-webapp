import { useState, useEffect, useCallback } from 'react';
import Header from './components/layout/Header';
import BingoCard from './components/bingo/BingoCard';
import ChallengeModal from './components/bingo/ChallengeModal';
import Timer from './components/sidebar/Timer';
import Leaderboard from './components/sidebar/Leaderboard';
import { Auth } from './components/auth/Auth';
import { supabase } from './lib/supabase';
import type { Challenge, Team, Game, Player } from './types/game';

function App() {
  const [teamId, setTeamId] = useState<string | null>(localStorage.getItem('teamId'));
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        const myProgress = progressData.filter((p: any) => p.team_id === teamId);
        const enrichedChallenges = challengesData.map(c => ({
          ...c,
          isCompleted: myProgress.some((p: any) => p.challenge_id === c.id) || c.is_free_space
        }));
        
        setChallenges(enrichedChallenges);

        const teamsWithScores = teamsData.map(t => ({
          ...t,
          score: progressData.filter((p: any) => p.team_id === t.id).length
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

  useEffect(() => {
    fetchData();

    if (teamId) {
      const progressChannel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'team_progress' },
          () => fetchData()
        )
        .subscribe();

      return () => {
        supabase.removeChannel(progressChannel);
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
  };

  const handleSignOut = () => {
    localStorage.removeItem('teamId');
    setTeamId(null);
    setCurrentTeam(null);
    setGame(null);
  };

  const handleSquareClick = (challenge: Challenge) => {
    if (challenge.isCompleted) return;
    setSelectedChallenge(challenge);
  };

  const handleCompleteChallenge = async (id: string) => {
    if (!teamId) return;
    try {
      const { error } = await supabase
        .from('team_progress')
        .insert([{
          team_id: teamId,
          challenge_id: id
        }]);

      if (error) throw error;
      setSelectedChallenge(null);
    } catch (error) {
      console.error('Error completing challenge:', error);
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

  if (!teamId) {
    return <Auth onLogin={handleLogin} />;
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

  if (error || (teamId && !game)) {
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
      <Header teamName={currentTeam?.name || 'Loading...'} onSignOut={handleSignOut} />
      
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
          {game && (
            <Timer startTime={new Date(game.created_at).getTime()} durationSeconds={game.duration_seconds} />
          )}
          <Leaderboard teams={teams} currentTeamId={teamId || ''} />
          <button 
            onClick={handleSignOut}
            style={{
              marginTop: '1rem',
              padding: '0.75rem',
              backgroundColor: 'transparent',
              color: 'var(--color-text)',
              border: '2px solid var(--color-bg-dark)',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              opacity: 0.7
            }}
          >
            Sign Out
          </button>
        </aside>
      </main>

      <ChallengeModal 
        challenge={selectedChallenge}
        onClose={() => setSelectedChallenge(null)}
        onComplete={handleCompleteChallenge}
      />
    </div>
  );
}

export default App;
