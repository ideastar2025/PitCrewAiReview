import { render, screen } from '@testing-library/react';
import App from './App';

describe('App Component', () => {
  test('renders PitCrew AI', () => {
    render(<App />);
    const linkElement = screen.getByText(/PitCrew AI/i);
    expect(linkElement).toBeInTheDocument();
  });

  test('renders login page for unauthenticated users', () => {
    render(<App />);
    const loginButton = screen.getByText(/Continue with GitHub/i);
    expect(loginButton).toBeInTheDocument();
  });

  test('redirects to dashboard when authenticated', () => {
    // Mock authenticated state
    const mockUser = { id: 1, name: 'Test User' };
    localStorage.setItem('token', 'mock-token');
    localStorage.setItem('user', JSON.stringify(mockUser));

    render(<App />);
    
    // Should redirect to dashboard
    expect(window.location.pathname).toBe('/dashboard');
  });

  test('shows 404 page for invalid routes', () => {
    window.history.pushState({}, 'Test Page', '/invalid-route');
    
    render(<App />);
    
    const notFoundElement = screen.getByText(/404/i);
    expect(notFoundElement).toBeInTheDocument();
  });
});