// src/pages/AuthPage.tsx

import { useState } from 'react';
import './AuthPage.css';
import { supabase } from '../lib/supabaseClient';

type AuthView = 'signIn' | 'signUp';

function AuthPage() {
  const [currentView, setCurrentView] = useState<AuthView>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // Ajout d'un état de chargement pour les boutons

  const showSignUp = (event: React.MouseEvent) => {
    event.preventDefault();
    setCurrentView('signUp');
    setEmail('');
    setPassword('');
  };

  const showSignIn = (event: React.MouseEvent) => {
    event.preventDefault();
    setCurrentView('signIn');
    setEmail('');
    setPassword('');
  };

  const handleSignUp = async (event: React.MouseEvent) => {
    event.preventDefault();
    setLoading(true); // Désactive le bouton
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    if (error) {
      alert('Error signing up: ' + error.message);
    } else if (data.user) {
      alert('Account created successfully! You can now sign in.');
      setCurrentView('signIn');
      setEmail('');
      setPassword('');
    }
    setLoading(false); // Réactive le bouton
  };

  const handleSignIn = async (event: React.MouseEvent) => {
    event.preventDefault();
    setLoading(true); // Désactive le bouton
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      alert('Error signing in: ' + error.message);
    }
    // Si la connexion réussit, onAuthStateChange dans App.tsx s'occupe du reste.
    setLoading(false); // Réactive le bouton en cas d'erreur
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">CogniFlow</h1>
        <p className="auth-subtitle">
          {currentView === 'signIn'
            ? 'Welcome back. Please sign in to continue.'
            : 'Create an account to get started.'}
        </p>

        {currentView === 'signIn' && (
          <div id="signin-section">
            <div className="auth-section">
              <input 
                id="signin-email" 
                type="email" 
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input 
                id="signin-password" 
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                id="signin-button" 
                className="button button-primary" 
                style={{ width: '100%' }}
                onClick={handleSignIn}
                disabled={loading} // Le bouton est désactivé pendant le chargement
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
            <p className="toggle-auth">
              Don't have an account? <a href="#" onClick={showSignUp}>Sign Up</a>
            </p>
          </div>
        )}

        {currentView === 'signUp' && (
          <div id="signup-section">
            <div className="auth-section">
              <input
                id="signup-email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                id="signup-password"
                type="password"
                placeholder="Choose a password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                id="signup-button"
                className="button button-primary"
                style={{ width: '100%' }}
                onClick={handleSignUp}
                disabled={loading} // Le bouton est désactivé pendant le chargement
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
            <p className="toggle-auth">
              Already have an account? <a href="#" onClick={showSignIn}>Sign In</a>
            </p>
          </div>
        )}

        <div className="auth-divider">or</div>
        <button id="signin-google-button" className="button" style={{ width: '100%' }} disabled={loading}>
          Sign In with Google
        </button>
      </div>
    </div>
  );
}

export default AuthPage;