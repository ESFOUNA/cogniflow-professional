import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { GoogleIcon } from '../components/GoogleIcon';
import './AuthPage.css';

type AuthView = 'signIn' | 'signUp' | 'forgotPassword';

function AuthPage() {
    const [currentView, setCurrentView] = useState<AuthView>('signIn');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const showSignUp = (e: React.MouseEvent) => { e.preventDefault(); setCurrentView('signUp'); };
    const showSignIn = (e: React.MouseEvent) => { e.preventDefault(); setCurrentView('signIn'); };
    const showForgotPassword = (e: React.MouseEvent) => { e.preventDefault(); setCurrentView('forgotPassword'); };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            alert('Error signing up: ' + error.message);
        } else if (data.user) {
            alert('Account created successfully! You can now sign in.');
            setCurrentView('signIn');
            setEmail('');
            setPassword('');
        }
    };
    
    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            alert('Error signing in: ' + error.message);
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'cogniflow://auth/callback',
        });
    
        if (error) {
            alert('Error sending recovery link: ' + error.message);
        } else {
            alert('Recovery link sent! Please check your email to continue.');
        }
    };

    const handleGoogleSignIn = async () => {
        const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: 'cogniflow://auth/callback' } });
        if (error) {
            alert('Error with Google sign-in: ' + error.message);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1 className="auth-title">CogniFlow</h1>
                <p className="auth-subtitle">
                    {currentView === 'signIn' && 'Welcome back. Please sign in to continue.'}
                    {currentView === 'signUp' && 'Create an account to get started.'}
                    {currentView === 'forgotPassword' && 'Enter your email to reset your password.'}
                </p>

                {currentView === 'signIn' && (
                    <div id="signin-section">
                        <form className="auth-section" onSubmit={handleSignIn}>
                            <input id="signin-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required />
                            <input id="signin-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
                            <p className="toggle-auth" style={{ textAlign: 'right', marginTop: 0, marginBottom: '15px' }}>
                                <a href="#" onClick={showForgotPassword}>Forgot Password?</a>
                            </p>
                            <button type="submit" className="button button-primary" style={{ width: '100%' }}>
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
                        <form className="auth-section" onSubmit={handleSignUp}>
                            <input id="signup-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" required />
                            <input id="signup-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Choose a password (min. 6 characters)" required />
                            <button type="submit" className="button button-primary" style={{ width: '100%' }}>
                                Create Account
                            </button>
                        </form>
                        <p className="toggle-auth">
                            Already have an account? <a href="#" onClick={showSignIn}>Sign In</a>
                        </p>
                    </div>
                )}
                
                {currentView === 'forgotPassword' && (
                    <div id="forgot-password-section">
                        <form className="auth-section" onSubmit={handlePasswordReset}>
                            <input id="reset-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Your email address" required />
                            <button type="submit" className="button button-primary" style={{ width: '100%' }}>
                                Send Reset Link
                            </button>
                        </form>
                        <p className="toggle-auth">
                            Remembered your password? <a href="#" onClick={showSignIn}>Sign In</a>
                        </p>
                    </div>
                )}

                <div className="auth-divider">or</div>
                
                <button id="signin-google-button" className="button" style={{ width: '100%' }} onClick={handleGoogleSignIn}>
                    <GoogleIcon /> Sign In with Google
                </button>
            </div>
        </div>
    );
}

export default AuthPage;