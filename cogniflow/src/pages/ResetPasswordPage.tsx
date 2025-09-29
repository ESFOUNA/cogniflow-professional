// src/pages/ResetPasswordPage.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
// On réutilise le CSS de la page d'authentification
import './AuthPage.css';

type ResetPasswordPageProps = {
    onPasswordUpdated: () => void;
};

function ResetPasswordPage({ onPasswordUpdated }: ResetPasswordPageProps) {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }
        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return;
        }

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            alert("Error updating password: " + error.message);
        } else {
            alert("Password updated successfully!");
            onPasswordUpdated(); // On notifie le parent pour changer de vue
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <h1 className="auth-title">Reset Your Password</h1>
                <p className="auth-subtitle">Enter and confirm your new password below.</p>
                <form className="auth-section" onSubmit={handleReset}>
                    <input 
                        type="password" 
                        placeholder="New password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <input 
                        type="password" 
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button type="submit" className="button button-primary" style={{ width: '100%' }}>
                        Save New Password
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPasswordPage;