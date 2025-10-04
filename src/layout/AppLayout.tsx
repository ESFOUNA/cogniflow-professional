// src/layout/AppLayout.tsx
import { useState } from 'react';
import DashboardPage from "../pages/DashboardPage";
import SettingsPage from "../pages/SettingsPage";
import LaunchSequencePage from '../pages/LaunchSequencePage';
import FocusSessionPage from '../pages/FocusSessionPage';
import { supabase } from '../lib/supabaseClient';
import { Rocket, Settings, LogOut } from 'lucide-react'; // On importe les icônes

type Action = { type: string; target: string };
type Ritual = { id: number; name: string; description: string | null; actions: Action[] };

function AppLayout() {
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'settings'>('dashboard');
    const [executingRitual, setExecutingRitual] = useState<Ritual | null>(null);
    const [activeFocusSession, setActiveFocusSession] = useState<Ritual | null>(null);
    
    // NOUVEAU : État pour stocker la durée de la session en minutes
    const [sessionDuration, setSessionDuration] = useState(25); // 25 minutes par défaut

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    // Priorité 1 : Session de concentration
    if (activeFocusSession) {
        return (
            <FocusSessionPage 
                ritualName={activeFocusSession.name}
                durationInMinutes={sessionDuration}
                onStop={() => setActiveFocusSession(null)} // Pour revenir au dashboard
            />
        );
    }
    
    // Priorité 2 : Séquence de lancement
    if (executingRitual) {
        return (
            <LaunchSequencePage 
                ritual={executingRitual}
                onComplete={() => {
                    setActiveFocusSession(executingRitual);
                    setExecutingRitual(null);
                }} 
            />
        );
    }

    // Layout normal
    return (
        <div className="app-layout" style={{ display: 'flex', width: '100%', height: '100vh' }}>
            <nav className="sidebar" style={{ width: '72px', backgroundColor: 'var(--bg-space)', borderRight: '1px solid var(--border-color)', padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div className="nav-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                    {/* NOUVEAU : On remplace 'R' par l'icône Rocket */}
                    <button 
                        className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setCurrentPage('dashboard')}
                        title="Rituals"
                        style={{ 
                            width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', color: currentPage === 'dashboard' ? 'white' : 'var(--text-secondary)',
                            display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'var(--transition-fast)', border: 'none', background: currentPage === 'dashboard' ? 'var(--accent-glow)' : 'none' 
                        }}
                    >
                        <Rocket size={24} />
                    </button>
                    
                    {/* NOUVEAU : On remplace 'S' par l'icône Settings */}
                    <button 
                        className={`nav-button ${currentPage === 'settings' ? 'active' : ''}`}
                        onClick={() => setCurrentPage('settings')}
                        title="Paramètres"
                        style={{ 
                            width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', color: currentPage === 'settings' ? 'white' : 'var(--text-secondary)',
                            display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'var(--transition-fast)', border: 'none', background: currentPage === 'settings' ? 'var(--accent-glow)' : 'none'
                        }}
                    >
                        <Settings size={24} />
                    </button>
                    
                    {/* NOUVEAU : On remplace 'L' par l'icône LogOut */}
                    <button 
                        className="nav-button" 
                        onClick={handleLogout}
                        title="Déconnexion" 
                        style={{ marginTop: 'auto', width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', color: 'var(--text-secondary)', display: 'grid', placeItems: 'center', cursor: 'pointer', border: 'none', background: 'none' }}
                    >
                        <LogOut size={24} />
                    </button>
                </div>
            </nav>
            
            <main className="main-content" style={{ flexGrow: 1, overflowY: 'auto' }}>
                {currentPage === 'dashboard' && (
                    <DashboardPage 
                        onLaunchRitual={setExecutingRitual}
                        // On passe la valeur et la fonction pour la modifier
                        sessionDuration={sessionDuration}
                        setSessionDuration={setSessionDuration}
                    />
                )}
                {currentPage === 'settings' && <SettingsPage />}
            </main>
        </div>
    );
}

export default AppLayout;