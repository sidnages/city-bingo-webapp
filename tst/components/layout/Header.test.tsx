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
});
