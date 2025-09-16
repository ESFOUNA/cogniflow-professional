// src/layout/AppLayout.tsx
import { useState } from 'react';
import DashboardPage from "../pages/DashboardPage";
import SettingsPage from "../pages/SettingsPage";
import { supabase } from '../lib/supabaseClient';

function AppLayout() {
    // État pour savoir quelle page afficher (Accueil ou Paramètres)
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'settings'>('dashboard');

    // Note: Dans une application réelle, nous utiliserions React Router, mais pour Tauri,
    // la gestion d'état simple est suffisante.

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <DashboardPage />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <DashboardPage />;
        }
    };

    return (
        <div className="app-layout" style={{ display: 'flex', width: '100%', height: '100%' }}>
            {/* La Barre de Navigation Latérale */}
            <nav className="sidebar" style={{ width: '72px', backgroundColor: 'var(--bg-space)', borderRight: '1px solid var(--border-color)', padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div className="nav-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Bouton Dashboard */}
                    <button 
                        className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setCurrentPage('dashboard')}
                        title="Rituals"
                        style={{ 
                            width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', color: currentPage === 'dashboard' ? 'white' : 'var(--text-secondary)',
                            display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'var(--transition-fast)', border: 'none', background: currentPage === 'dashboard' ? 'var(--accent-glow)' : 'none' 
                        }}
                    >
                        {/* Note: Nous utilisons le texte 'R' et 'S' au lieu des vrais icônes Lucide pour simplifier le code */}
                        R
                    </button>
                    
                    {/* Bouton Settings */}
                    <button 
                        className={`nav-button ${currentPage === 'settings' ? 'active' : ''}`}
                        onClick={() => setCurrentPage('settings')}
                        title="Paramètres"
                        style={{ 
                            width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', color: currentPage === 'settings' ? 'white' : 'var(--text-secondary)',
                            display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'var(--transition-fast)', border: 'none', background: currentPage === 'settings' ? 'var(--accent-glow)' : 'none'
                        }}
                    >
                        S
                    </button>
                    
                    {/* Bouton Déconnexion */}
                    <button 
                        className="nav-button" 
                        onClick={handleLogout}
                        title="Déconnexion" 
                        style={{ marginTop: 'auto', color: 'var(--danger)' }}
                    >
                        L
                    </button>
                </div>
            </nav>
            
            {/* Contenu Principal */}
            <main className="main-content" style={{ flexGrow: 1, padding: '32px 48px', overflowY: 'auto' }}>
                {renderPage()}
            </main>
        </div>
    );
}

export default AppLayout;