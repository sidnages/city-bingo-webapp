import React from 'react';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  teamName: string;
}

const Header: React.FC<HeaderProps> = ({ teamName }) => {
  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1rem 2rem',
      backgroundColor: 'var(--color-white)',
      borderBottom: '4px solid var(--color-primary)',
      marginBottom: '2rem'
    }} className="fun-shadow">
      <h1 style={{ color: 'var(--color-secondary)', fontSize: '1.5rem', fontWeight: 'bold' }}>
        City Bingo
      </h1>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <span style={{ fontWeight: '600', color: 'var(--color-accent)' }}>
          {teamName}
        </span>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          backgroundColor: 'var(--color-bg)',
          color: 'var(--color-accent)',
          borderRadius: 'var(--radius-md)',
          fontWeight: '600',
          transition: 'all 0.2s'
        }}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default Header;
