import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthPage from '../pages/AuthPage';

// Mock Supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOAuth: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    },
  },
}));

import { supabase } from '../lib/supabaseClient';

describe('AuthPage - Forgot Password Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows "Forgot Password?" link on sign in view', () => {
    render(<BrowserRouter><AuthPage /></BrowserRouter>);
    
    const forgotPasswordLink = screen.getByText('Forgot Password?');
    expect(forgotPasswordLink).toBeInTheDocument();
  });

  it('navigates to forgot password view when clicking "Forgot Password?" link', () => {
    render(<BrowserRouter><AuthPage /></BrowserRouter>);
    
    const forgotPasswordLink = screen.getByText('Forgot Password?');
    fireEvent.click(forgotPasswordLink);
    
    // Should now show the forgot password view
    expect(screen.getByText('Enter your email to reset your password.')).toBeInTheDocument();
    expect(screen.getByText('Send Reset Link')).toBeInTheDocument();
  });

  it('calls supabase.auth.resetPasswordForEmail when submitting forgot password form', async () => {
    const mockResetPasswordForEmail = supabase.auth.resetPasswordForEmail as jest.Mock;
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    
    render(<BrowserRouter><AuthPage /></BrowserRouter>);
    
    // Navigate to forgot password view
    fireEvent.click(screen.getByText('Forgot Password?'));
    
    // Enter email
    const emailInput = screen.getByPlaceholderText('Your email address');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Submit form
    fireEvent.click(screen.getByText('Send Reset Link'));
    
    // Verify Supabase was called with correct parameters
    await waitFor(() => {
      expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com', {
        redirectTo: 'cogniflow://auth/callback',
      });
    });
  });

  it('shows success message after sending reset link', async () => {
    const mockResetPasswordForEmail = supabase.auth.resetPasswordForEmail as jest.Mock;
    mockResetPasswordForEmail.mockResolvedValue({ error: null });
    
    // Mock alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<BrowserRouter><AuthPage /></BrowserRouter>);
    
    // Navigate to forgot password view
    fireEvent.click(screen.getByText('Forgot Password?'));
    
    // Enter email and submit
    fireEvent.change(screen.getByPlaceholderText('Your email address'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.click(screen.getByText('Send Reset Link'));
    
    // Verify success message is shown
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Recovery link sent! Please check your email to continue.');
    });
    
    alertSpy.mockRestore();
  });

  it('shows error message when reset password fails', async () => {
    const mockResetPasswordForEmail = supabase.auth.resetPasswordForEmail as jest.Mock;
    mockResetPasswordForEmail.mockResolvedValue({ error: { message: 'Email not found' } });
    
    // Mock alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    
    render(<BrowserRouter><AuthPage /></BrowserRouter>);
    
    // Navigate to forgot password view
    fireEvent.click(screen.getByText('Forgot Password?'));
    
    // Enter email and submit
    fireEvent.change(screen.getByPlaceholderText('Your email address'), { 
      target: { value: 'test@example.com' } 
    });
    fireEvent.click(screen.getByText('Send Reset Link'));
    
    // Verify error message is shown
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Error sending recovery link: Email not found');
    });
    
    alertSpy.mockRestore();
  });

  it('can navigate back to sign in from forgot password view', () => {
    render(<BrowserRouter><AuthPage /></BrowserRouter>);
    
    // Navigate to forgot password view
    fireEvent.click(screen.getByText('Forgot Password?'));
    
    // Click Sign In link to go back
    fireEvent.click(screen.getByText('Sign In'));
    
    // Should be back on sign in view
    expect(screen.getByText('Welcome back. Please sign in to continue.')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });
});

// Note: Deep linking (cogniflow://auth/callback) cannot be tested with unit tests
// because it requires:
// 1. A system-level deep link handler
// 2. The Tauri runtime environment
// 3. Native OS integration
//
// For deep link testing, you would need:
// - Integration tests with Tauri's test harness
// - E2E tests using Playwright that simulate OS deep link clicks
// - Manual testing in a built application
//
// The deep link handling is tested indirectly through:
// 1. The unit tests above that verify resetPasswordForEmail is called with correct redirect URL
// 2. Integration tests that can be added to test/e2e/ folder
