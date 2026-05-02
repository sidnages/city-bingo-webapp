import { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import BingoCard from './components/bingo/BingoCard';
import ChallengeModal from './components/bingo/ChallengeModal';
import Timer from './components/sidebar/Timer';
import Leaderboard from './components/sidebar/Leaderboard';
import { BINGO_CHALLENGES, MOCK_TEAMS } from './data/mockData';
import type { Challenge, Team } from './types/game';

function App() {
  const [challenges, setChallenges] = useState<Challenge[]>(BINGO_CHALLENGES);
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [startTime] = useState(Date.now());
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSquareClick = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
  };

  const handleCompleteChallenge = (id: string) => {
    setChallenges(prev => prev.map(c => 
      c.id === id ? { ...c, isCompleted: true } : c
    ));
    
    // Update our team's score in the leaderboard (mock)
    setTeams(prev => prev.map(t => 
      t.id === 'team-1' ? { ...t, score: t.score + 1 } : t
    ));

    // Close modal after a short delay or immediately
    setSelectedChallenge(prev => prev ? { ...prev, isCompleted: true } : null);
  };

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
          <Timer startTime={startTime} />
          <Leaderboard teams={teams} currentTeamId="team-1" />
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
