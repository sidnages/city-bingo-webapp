import React from 'react';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  teamName: string;
  onSignOut?: () => void;
  children?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ teamName, onSignOut, children }) => {
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
    }} className="fun-shadow">
      <h1 style={{ color: 'var(--color-secondary)', fontSize: '1.5rem', fontWeight: 'bold' }}>
        City Bingo
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flex: 1, justifyContent: 'flex-end' }}>
        {children}
        <span style={{ fontWeight: '600', color: 'var(--color-accent)' }}>
          {teamName}
        </span>
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
    </header>
  );
};

export default Header;
