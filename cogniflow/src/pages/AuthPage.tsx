// src/pages/AuthPage.tsx

import { useState } from 'react';
import './AuthPage.css';

// On définit un type pour notre état, pour plus de sécurité et de clarté.
type AuthView = 'signIn' | 'signUp';

function AuthPage() {
  // On crée notre variable d'état.
  // 'currentView' est la valeur actuelle (initialisée à 'signIn').
  // 'setCurrentView' est la fonction spéciale pour la modifier.
  const [currentView, setCurrentView] = useState<AuthView>('signIn');

  // On crée les fonctions qui seront appelées par les clics.
  const showSignUp = (event: React.MouseEvent) => {
    event.preventDefault(); // Empêche le lien de recharger la page.
    setCurrentView('signUp'); // On met à jour l'état.
  };

  const showSignIn = (event: React.MouseEvent) => {
    event.preventDefault(); // Empêche le lien de recharger la page.
    setCurrentView('signIn'); // On met à jour l'état.
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">CogniFlow</h1>
        <p className="auth-subtitle">
          {/* Le sous-titre change dynamiquement en fonction de l'état ! */}
          {currentView === 'signIn'
            ? 'Welcome back. Please sign in to continue.'
            : 'Create an account to get started.'}
        </p>

        {/* Section de Connexion (Sign In) */}
        {/* On utilise un rendu conditionnel : cette partie s'affiche SEULEMENT SI currentView est 'signIn'. */}
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
        {/* Cette partie s'affiche SEULEMENT SI currentView est 'signUp'. */}
        {currentView === 'signUp' && (
          <div id="signup-section">
            <div className="auth-section">
              <input id="signup-email" type="email" placeholder="Email address" />
              <input id="signup-password" type="password" placeholder="Choose a password" />
              <button id="signup-button" className="button button-primary" style={{ width: '100%' }}>
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