// src/pages/AuthPage.tsx

import { useState } from 'react';
import './AuthPage.css';
import { supabase } from '../lib/supabaseClient'; // On importe notre client Supabase

type AuthView = 'signIn' | 'signUp';

function AuthPage() {
  const [currentView, setCurrentView] = useState<AuthView>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const showSignUp = (event: React.MouseEvent) => {
    event.preventDefault();
    setCurrentView('signUp');
  };

  const showSignIn = (event: React.MouseEvent) => {
    event.preventDefault();
    setCurrentView('signIn');
  };

  const handleSignUp = async (event: React.MouseEvent) => {
    event.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      alert('Error signing up: ' + error.message);
    } else if (data.user) {
      // Puisque nous avons désactivé la confirmation par email, ce message est plus direct.
      alert('Account created successfully! You can now sign in.');
      setEmail('');
      setPassword('');
      // On ramène l'utilisateur au formulaire de connexion après une inscription réussie.
      setCurrentView('signIn');
    }
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

        {/* Section de Connexion (Sign In) */}
        {currentView === 'signIn' && (
          <div id="signin-section">
            <div className="auth-section">
              <input id="signin-email" type="email" placeholder="Email address" />
              <input id="signin-password" type="password" placeholder="Password" />
              <button id="signin-button" className="button button-primary" style={{ width: '100%' }}>
                Sign In
              </button>
            </div>
            <p className="toggle-auth">
              Don't have an account? <a href="#" onClick={showSignUp}>Sign Up</a>
            </p>
          </div>
        )}

        {/* Section d'Inscription (Sign Up) */}
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
              >
                Create Account
              </button>
            </div>
            <p className="toggle-auth">
              Already have an account? <a href="#" onClick={showSignIn}>Sign In</a>
            </p>
          </div>
        )}

        <div className="auth-divider">or</div>

        <button id="signin-google-button" className="button" style={{ width: '100%' }}>
          Sign In with Google
        </button>
      </div>
    </div>
  );
}

export default AuthPage;