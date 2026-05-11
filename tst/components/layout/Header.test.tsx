import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from '../../../src/components/layout/Header';

describe('Header', () => {
  it('renders the team name', () => {
    render(<Header teamName="Test Team" />);
    expect(screen.getByText('Test Team')).toBeInTheDocument();
  });

  it('calls onSignOut when sign out button is clicked', () => {
    const onSignOut = vi.fn();
    render(<Header teamName="Test Team" onSignOut={onSignOut} />);
    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);
    expect(onSignOut).toHaveBeenCalled();
  });

  it('renders and calls onShowRules when provided', () => {
    const onShowRules = vi.fn();
    render(<Header teamName="Test Team" onShowRules={onShowRules} />);
    const rulesButton = screen.getByText('Rules');
    expect(rulesButton).toBeInTheDocument();
    fireEvent.click(rulesButton);
    expect(onShowRules).toHaveBeenCalled();
  });

  it('renders children when provided', () => {
    render(
      <Header teamName="Test Team">
        <div data-testid="child">Child Content</div>
      </Header>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders the notification bell when onTogglePush is provided', () => {
    const onTogglePush = vi.fn();
    render(<Header teamName="Test Team" onTogglePush={onTogglePush} isSubscribed={false} />);
    
    // Check for BellOff icon (not subscribed)
    const bellButton = screen.getByTitle('Enable Notifications');
    expect(bellButton).toBeInTheDocument();
    
    const bellOffIcon = bellButton.querySelector('svg.lucide-bell-off');
    expect(bellOffIcon).toBeInTheDocument();
  });

  it('renders the filled bell icon when isSubscribed is true', () => {
    const onTogglePush = vi.fn();
    render(<Header teamName="Test Team" onTogglePush={onTogglePush} isSubscribed={true} />);
    
    const bellButton = screen.getByTitle('Disable Notifications');
    expect(bellButton).toBeInTheDocument();
    
    const bellIcon = bellButton.querySelector('svg.lucide-bell');
    expect(bellIcon).toBeInTheDocument();
  });

  it('calls onTogglePush when the bell is clicked', () => {
    const onTogglePush = vi.fn();
    render(<Header teamName="Test Team" onTogglePush={onTogglePush} isSubscribed={false} />);
    
    const bellButton = screen.getByTitle('Enable Notifications');
    fireEvent.click(bellButton);
    expect(onTogglePush).toHaveBeenCalled();
  });
});
