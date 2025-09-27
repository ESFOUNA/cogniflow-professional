// src/pages/AuthPage.tsx

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { GoogleIcon } from '../components/GoogleIcon';
import './AuthPage.css';

type AuthView = 'signIn' | 'signUp';

function AuthPage() {
  const [currentView, setCurrentView] = useState<AuthView>('signIn');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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

  const handleSignUp = async (event: React.FormEvent) => { // Changé en FormEvent
    event.preventDefault();
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
  };
  
  const handleSignIn = async (event: React.FormEvent) => { // Changé en FormEvent
    event.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    if (error) {
      alert('Error signing in: ' + error.message);
    }
  };

  // NOUVELLE FONCTION pour la connexion Google
  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      alert('Error with Google sign-in: ' + error.message);
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

        {currentView === 'signIn' && (
          <div id="signin-section">
            {/* NOUVEAU : On entoure le formulaire avec <form> */}
            <form className="auth-section" onSubmit={handleSignIn}>
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
                type="submit"
                className="button button-primary" 
                style={{ width: '100%' }}
              >
                Sign In
              </button>
            </form>
            <p className="toggle-auth">
              Don't have an account? <a href="#" onClick={showSignUp}>Sign Up</a>
            </p>
          </div>
        )}

        {currentView === 'signUp' && (
          <div id="signup-section">
            {/* NOUVEAU : On entoure le formulaire avec <form> */}
            <form className="auth-section" onSubmit={handleSignUp}>
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
                type="submit"
                className="button button-primary"
                style={{ width: '100%' }}
              >
                Create Account
              </button>
            </form>
            <p className="toggle-auth">
              Already have an account? <a href="#" onClick={showSignIn}>Sign In</a>
            </p>
          </div>
        )}

        <div className="auth-divider">or</div>

        {/* NOUVEAU : On ajoute l'icône au bouton */}
        <button 
          id="signin-google-button" 
          className="button" 
          style={{ width: '100%' }}
          onClick={handleGoogleSignIn}
        >
          <GoogleIcon /> Sign In with Google
        </button>
      </div>
    </div>
  );
}

export default AuthPage;