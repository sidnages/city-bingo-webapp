import React from 'react';
import { LogOut, Info, Bell, BellOff } from 'lucide-react';

interface HeaderProps {
  teamName: string;
  onSignOut?: () => void;
  onShowRules?: () => void;
  isSubscribed?: boolean;
  onTogglePush?: () => void;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ teamName, onSignOut, onShowRules, isSubscribed, onTogglePush, children }) => {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: 'var(--color-white)',
      borderBottom: '4px solid var(--color-primary)',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      gap: '1rem'
    }} className="fun-shadow header-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h1 className="header-title" style={{ color: 'var(--color-secondary)', fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
          City Bingo
        </h1>
        {onTogglePush && (
          <button 
            onClick={onTogglePush}
            title={isSubscribed ? 'Disable Notifications' : 'Enable Notifications'}
            style={{ 
              color: 'var(--color-secondary)', 
              display: 'flex', 
              alignItems: 'center', 
              padding: '0.25rem', 
              border: 'none', 
              background: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.2s',
              marginTop: '0.2rem'
            }}
          >
            {isSubscribed ? <Bell size={22} fill="currentColor" /> : <BellOff size={22} />}
          </button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, justifyContent: 'flex-end' }}>
        {children}

        <span style={{ fontWeight: '600', color: 'var(--color-accent)' }}>
          {teamName}
        </span>
        {onShowRules && (
          <button onClick={onShowRules} style={{ color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: 'none', background: 'transparent', fontWeight: '600' }}>
            <Info size={18} /> Rules
          </button>
        )}
        <button 
          onClick={onSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-accent)',
            borderRadius: 'var(--radius-md)',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .header-container {
            flex-direction: column;
            text-align: center;
          }
          .header-title {
            width: 100%;
            text-align: center;
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
