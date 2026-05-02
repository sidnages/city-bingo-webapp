import { useState, useEffect, useCallback } from 'react';
import Header from './components/layout/Header';
import BingoCard from './components/bingo/BingoCard';
import ChallengeModal from './components/bingo/ChallengeModal';
import Timer from './components/sidebar/Timer';
import Leaderboard from './components/sidebar/Leaderboard';
import { supabase } from './lib/supabase';
import type { Challenge, Team, Game, TeamProgress } from './types/game';

// Default Game ID from sample data
const DEFAULT_GAME_ID = 'd290f1ee-6c54-4b01-90e6-d701748f0851';
const CURRENT_TEAM_ID = '4f7b6b1a-9f5b-4c1a-8e1a-5b6b1a9f5b4c'; // Mocking currently logged in team (The Explorers)

function App() {
  const [game, setGame] = useState<Game | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Initial Data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration is missing. Please check your .env.local file.');
      }
      
      // Fetch Game
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .select('*')
        .eq('id', DEFAULT_GAME_ID)
        .single();
      
      if (gameError) {
        if (gameError.code === 'PGRST116') {
          throw new Error(`Game not found (ID: ${DEFAULT_GAME_ID}). Ensure you ran the SQL setup script and RLS is configured.`);
        }
        throw new Error(`Supabase Error: ${gameError.message}`);
      }

      if (gameData) setGame(gameData);

      // Fetch Challenges
      const { data: challengesData, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .eq('game_id', DEFAULT_GAME_ID)
        .order('position', { ascending: true });

      if (challengesError) throw challengesError;

      // Fetch Teams for this game
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('game_id', DEFAULT_GAME_ID);

      if (teamsError) throw teamsError;

      // Fetch Progress for ALL teams in this game to calculate scores
      const { data: progressData, error: progressError } = await supabase
        .from('team_progress')
        .select('*, challenges!inner(game_id)')
        .eq('challenges.game_id', DEFAULT_GAME_ID);

      if (progressError) throw progressError;

      if (challengesData && teamsData && progressData) {
        // Map progress to current team's challenges
        const myProgress = progressData.filter((p: any) => p.team_id === CURRENT_TEAM_ID);
        const enrichedChallenges = challengesData.map(c => ({
          ...c,
          isCompleted: myProgress.some((p: any) => p.challenge_id === c.id) || c.is_free_space
        }));
        
        setChallenges(enrichedChallenges);

        // Calculate scores for leaderboard
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
  }, []);

  useEffect(() => {
    fetchData();

    // 2. Real-time Subscriptions
    const progressChannel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'team_progress' },
        () => {
          // Re-fetch everything on change for simplicity, 
          // or we could surgically update state
          fetchData();
        }
      )
      .subscribe();

    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      supabase.removeChannel(progressChannel);
    };
  }, [fetchData]);

  const handleSquareClick = (challenge: Challenge) => {
    if (challenge.isCompleted) return;
    setSelectedChallenge(challenge);
  };

  const handleCompleteChallenge = async (id: string) => {
    try {
      // 3. Update Database
      const { error } = await supabase
        .from('team_progress')
        .insert([{
          team_id: CURRENT_TEAM_ID,
          challenge_id: id
        }]);

      if (error) throw error;

      // Local state will be updated via real-time subscription
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
      height: '100vh', 
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
        maxWidth: '500px'
      }}>
        {children}
      </div>
    </div>
  );

  if (loading) {
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
        <p style={{ marginTop: '0.5rem', color: 'var(--color-text)', opacity: 0.7 }}>Get ready for the hunt!</p>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </FullScreenState>
    );
  }

  if (error || !game) {
    return (
      <FullScreenState isError>
        <h2 style={{ color: 'var(--color-secondary)', marginBottom: '1rem' }}>Oops!</h2>
        <p style={{ color: 'var(--color-text)', marginBottom: '2rem', lineHeight: 1.5 }}>
          {error || 'Game not found. Please ensure your database is set up correctly.'}
        </p>
        <button 
          onClick={() => fetchData()}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: 'var(--color-secondary)',
            color: 'var(--color-white)',
            borderRadius: 'var(--radius-md)',
            fontWeight: 'bold',
            fontSize: '1rem'
          }}
        >
          Try Again
        </button>
      </FullScreenState>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      <Header teamName="The Explorers" />
      
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '2rem',
        alignItems: isMobile ? 'center' : 'flex-start'
      }}>
        {/* Bingo Card Section */}
        <section style={{ flex: '1', width: '100%', maxWidth: '650px' }}>
          <BingoCard 
            challenges={challenges} 
            onSquareClick={handleSquareClick} 
          />
        </section>

        {/* Sidebar Section */}
        <aside style={{ 
          width: isMobile ? '100%' : '320px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.5rem',
          position: isMobile ? 'static' : 'sticky',
          top: '2rem'
        }}>
          <Timer startTime={new Date(game.created_at).getTime()} durationSeconds={game.duration_seconds} />
          <Leaderboard teams={teams} currentTeamId={CURRENT_TEAM_ID} />
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
