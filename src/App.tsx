import { useState, useEffect, useCallback, useRef } from 'react';
import Header from './components/layout/Header';
import BingoCard from './components/bingo/BingoCard';
import ChallengeModal from './components/bingo/ChallengeModal';
import Timer from './components/layout/Timer';
import Leaderboard from './components/layout/Leaderboard';
import { Auth } from './components/auth/Auth';
import { BingoCelebration } from './components/bingo/BingoCelebration';
import { AdminDashboard } from './components/admin/AdminDashboard';
import BonusChallenges from './components/layout/BonusChallenges';
import RulesModal from './components/bingo/RulesModal';
import { supabase } from './lib/supabase';
import { calculateTeamScore } from './lib/scoring';
import { checkPushSubscription, requestNotificationPermission, subscribeUserToPush, unsubscribeUserFromPush } from './lib/notifications';
import type { Challenge, Team, Game, BonusChallenge } from './types/game';

function App() {
  const [teamId, setTeamId] = useState<string | null>(localStorage.getItem('teamId'));
  const [adminGameId, setAdminGameId] = useState<string | null>(localStorage.getItem('adminGameId'));
  const [activeView, setActiveView] = useState<'team' | 'admin'>(adminGameId && !teamId ? 'admin' : 'team');
  
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [game, setGame] = useState<Game | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [bonusChallenges, setBonusChallenges] = useState<BonusChallenge[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [selectedBonusChallenge, setSelectedBonusChallenge] = useState<BonusChallenge | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [showBingoEffect, setShowBingoEffect] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [, setBingoCount] = useState(0);
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

      // Check push subscription
      const subscribed = await checkPushSubscription(teamId);
      setIsSubscribed(subscribed);

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

      // Fetch Bonus Challenges
      const { data: bonusData, error: bonusError } = await supabase
        .from('bonus_challenges')
        .select('*')
        .eq('game_id', teamData.game_id)
        .order('release_at_minutes', { ascending: true });

      const initialBonusChallenges = bonusError ? [] : (bonusData || []);

      // Fetch All Teams for this game
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('game_id', teamData.game_id);

      if (teamsError) throw teamsError;
      const teamIds = teamsData.map(t => t.id);

      // Fetch Progress for ALL teams in this game
      const { data: progressData, error: progressError } = await supabase
        .from('team_progress')
        .select('*, challenges!inner(game_id)')
        .eq('challenges.game_id', teamData.game_id);

      if (progressError) throw progressError;

      // Fetch ALL Bonus Progress for this game
      const { data: allBonusProgressData, error: allBonusProgressError } = await supabase
        .from('bonus_team_progress')
        .select('*')
        .in('team_id', teamIds);
      
      const allBonusProgress = allBonusProgressError ? [] : (allBonusProgressData || []);

      if (challengesData && teamsData && progressData) {
        const uniqueChallengesMap = new Map();
        challengesData.forEach(c => {
          if (!uniqueChallengesMap.has(c.position)) {
            uniqueChallengesMap.set(c.position, c);
          }
        });
        const filteredChallenges = Array.from(uniqueChallengesMap.values());

        const myProgress = progressData.filter((p: any) => p.team_id === teamId);
        const enrichedChallenges = filteredChallenges.map(c => {
          const progress = myProgress.find((p: any) => p.challenge_id === c.id);
          return {
            ...c,
            isCompleted: !!progress || c.is_free_space,
            instagramUrl: progress?.instagram_url
          };
        });
        
        setChallenges(enrichedChallenges);

        // Enrich Bonus Challenges
        const enrichedBonus = initialBonusChallenges.map(bc => {
          const progress = allBonusProgress.find((bp: any) => bp.team_id === teamId && bp.bonus_challenge_id === bc.id);
          return {
            ...bc,
            isCompleted: !!progress,
            instagramUrl: progress?.instagram_url
          };
        });
        setBonusChallenges(enrichedBonus);

        // Check for Bingo
        const bingoPatterns = [
          [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
          [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
          [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
        ];

        let currentBingoCount = 0;
        bingoPatterns.forEach(pattern => {
          if (pattern.every(pos => enrichedChallenges[pos]?.isCompleted)) {
            currentBingoCount++;
          }
        });

        setBingoCount(prev => {
          if (currentBingoCount > prev && !isInitialLoad.current) {
            setShowBingoEffect(true);
          }
          return currentBingoCount;
        });

        isInitialLoad.current = false;

        const teamsWithData = teamsData.map(t => {
          const calculatedScore = calculateTeamScore(
            t.id, 
            progressData, 
            filteredChallenges, 
            {
              square: gameData.points_per_square,
              bingo: gameData.points_per_bingo,
              unique: gameData.points_per_unique
            },
            allBonusProgress,
            initialBonusChallenges
          );
          
          return {
            ...t,
            calculatedScore,
            score: gameData.published_at ? calculatedScore : progressData.filter((p: any) => p.team_id === t.id).length
          };
        });
        setTeams(teamsWithData);
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
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bonus_team_progress' }, () => fetchData())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'bonus_challenges' }, () => fetchData())
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

  const handleBonusClick = (bonus: BonusChallenge) => {
    setSelectedBonusChallenge(bonus);
  };

  const getCompletionStatus = () => {
    if (game?.stopped_at) return { canComplete: false, disabledReason: "The game has ended." };
    if (!currentTeam?.started_at) return { canComplete: false, disabledReason: 'Your run has not started yet.' };

    const startTime = new Date(currentTeam.started_at).getTime();
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const isTimeUp = elapsed >= (game?.duration_seconds || 0);

    if (isTimeUp) return { canComplete: false, disabledReason: "Time's up!" };
    return { canComplete: true };
  };

  const { canComplete, disabledReason } = getCompletionStatus();

  const handleCompleteChallenge = async (challenge: Challenge, instagramUrl?: string) => {
    if (!teamId) return;
    try {
      if (challenge.isCompleted) {
        const { data: progress } = await supabase.from('team_progress').select('id').eq('team_id', teamId).eq('challenge_id', challenge.id).single();
        if (progress) await supabase.from('team_progress').delete().eq('id', progress.id);
      } else {
        await supabase.from('team_progress').insert([{ team_id: teamId, challenge_id: challenge.id, instagram_url: instagramUrl }]);
      }
      setSelectedChallenge(null);
      await fetchData();
    } catch (error) {
      console.error('Error toggling challenge:', error);
    }
  };

  const handleCompleteBonusChallenge = async (bonusChallenge: BonusChallenge, instagramUrl?: string) => {
    if (!teamId || !canComplete) return;

    // Final check for expiry before submitting
    const startTime = currentTeam?.started_at ? new Date(currentTeam.started_at).getTime() : 0;
    const elapsedMinutes = (Date.now() - startTime) / 60000;
    const isExpired = elapsedMinutes >= (bonusChallenge.release_at_minutes + bonusChallenge.duration_minutes) || !!game?.stopped_at;

    if (isExpired && !bonusChallenge.isCompleted) {
      alert("This bonus challenge has just expired and can no longer be completed.");
      return;
    }

    try {
      if (bonusChallenge.isCompleted) {
        // Uncomplete: find bonus progress record and delete it
        const { data: progress } = await supabase
          .from('bonus_team_progress')
          .select('id')
          .eq('team_id', teamId)
          .eq('bonus_challenge_id', bonusChallenge.id)
          .single();
        
        if (progress) {
          await supabase.from('bonus_team_progress').delete().eq('id', progress.id);
        }
      } else {
        // Complete: insert new record
        await supabase.from('bonus_team_progress').insert([{ 
          team_id: teamId, 
          bonus_challenge_id: bonusChallenge.id,
          instagram_url: instagramUrl
        }]);
      }
      await fetchData();
    } catch (error) {
      console.error('Error toggling bonus challenge:', error);
    }
  };

  const handleTogglePush = async () => {
    if (!teamId) return;
    
    if (isSubscribed) {
      const success = await unsubscribeUserFromPush(teamId);
      if (success) setIsSubscribed(false);
    } else {
      const granted = await requestNotificationPermission();
      if (granted) {
        const success = await subscribeUserToPush(teamId);
        if (success) setIsSubscribed(success);
      } else {
        alert('Notification permission denied. Please enable it in your browser settings.');
      }
    }
  };

  if (!teamId && !adminGameId) return <Auth onLogin={handleLogin} onAdminLogin={handleAdminLogin} />;
  if (activeView === 'admin' && adminGameId) return <AdminDashboard gameId={adminGameId} onSignOut={handleSignOut} />;

  if (loading && !currentTeam) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: 'var(--color-bg)' }}>
        <h2 style={{ color: 'var(--color-primary)' }}>Loading Game...</h2>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      <Header 
        teamName={currentTeam?.name || 'Loading...'} 
        onSignOut={handleSignOut} 
        onShowRules={() => setShowRulesModal(true)}
        isSubscribed={isSubscribed}
        onTogglePush={handleTogglePush}
      />
      
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '2.5rem',
        alignItems: isMobile ? 'center' : 'center', // Vertically center the main row
        justifyContent: 'center'
      }}>
        <section style={{ flex: '1', width: '100%', maxWidth: '650px' }}>
          <BingoCard challenges={challenges} onSquareClick={handleSquareClick} />
        </section>

        <aside style={{ 
          width: isMobile ? '100%' : '320px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '1.25rem',
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

          <BonusChallenges 
            challenges={bonusChallenges}
            teamStartedAt={currentTeam?.started_at || null}
            isGameStopped={!!game?.stopped_at}
            onChallengeClick={handleBonusClick}
          />

          <Leaderboard 
            teams={teams} 
            currentTeamId={teamId || ''} 
            gameDurationSeconds={game?.duration_seconds || 0}
            gameStoppedAt={game?.stopped_at || null}
            isPublished={!!game?.published_at}
            compact={bonusChallenges.length > 0}
          />
        </aside>
      </main>

      <ChallengeModal 
        challenge={selectedChallenge}
        onClose={() => setSelectedChallenge(null)}
        onComplete={handleCompleteChallenge}
        canComplete={canComplete}
        disabledReason={disabledReason}
        requireInstagram={game?.require_instagram}
      />

      {selectedBonusChallenge && (
        <ChallengeModal 
          challenge={{
            id: selectedBonusChallenge.id,
            title: selectedBonusChallenge.title,
            description: selectedBonusChallenge.description,
            isCompleted: selectedBonusChallenge.isCompleted,
            game_id: selectedBonusChallenge.game_id,
            position: -1,
            is_free_space: false,
            instagramUrl: selectedBonusChallenge.instagramUrl
          }}
          onClose={() => setSelectedBonusChallenge(null)}
          onComplete={async (_challenge, instagramUrl) => {
            await handleCompleteBonusChallenge(selectedBonusChallenge, instagramUrl);
            setSelectedBonusChallenge(null);
          }}
          canComplete={(() => {
            if (selectedBonusChallenge.isCompleted) return false;
            if (!canComplete) return false;
            
            // Check if expired
            const startTime = currentTeam?.started_at ? new Date(currentTeam.started_at).getTime() : 0;
            const elapsedMinutes = (Date.now() - startTime) / 60000;
            const isExpired = elapsedMinutes >= (selectedBonusChallenge.release_at_minutes + selectedBonusChallenge.duration_minutes) || !!game?.stopped_at;
            
            return !isExpired;
          })()}
          disabledReason={(() => {
            if (selectedBonusChallenge.isCompleted) {
              return "For safety, bonus challenges can only be marked as incomplete by Admin after game is over.";
            }
            
            // Check if expired
            const startTime = currentTeam?.started_at ? new Date(currentTeam.started_at).getTime() : 0;
            const elapsedMinutes = (Date.now() - startTime) / 60000;
            const isExpired = elapsedMinutes >= (selectedBonusChallenge.release_at_minutes + selectedBonusChallenge.duration_minutes) || !!game?.stopped_at;
            
            if (isExpired) return "This bonus challenge has expired.";
            
            return disabledReason;
          })()}
          requireInstagram={game?.require_instagram}
        />
      )}

      {showRulesModal && game && (
        <RulesModal 
          onClose={() => setShowRulesModal(false)} 
          points={{ 
            square: game.points_per_square, 
            bingo: game.points_per_bingo, 
            unique: game.points_per_unique, 
            rules: game.game_rules 
          }} 
          hasBonuses={bonusChallenges.length > 0}
        />
      )}

      <BingoCelebration show={showBingoEffect} onComplete={() => setShowBingoEffect(false)} />
    </div>
  );
}

export default App;
