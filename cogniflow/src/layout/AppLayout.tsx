import { useState } from 'react';
import DashboardPage from "../pages/DashboardPage";
import SettingsPage from "../pages/SettingsPage";
import LaunchSequencePage from '../pages/LaunchSequencePage';
import { supabase } from '../lib/supabaseClient';

type Action = { type: string; target: string };
type Ritual = { id: number; name: string; description: string | null; actions: Action[] };

function AppLayout() {
    const [currentPage, setCurrentPage] = useState<'dashboard' | 'settings'>('dashboard');
    const [executingRitual, setExecutingRitual] = useState<Ritual | null>(null);

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <DashboardPage onLaunchRitual={setExecutingRitual} />;
            case 'settings':
                return <SettingsPage />;
            default:
                return <DashboardPage onLaunchRitual={setExecutingRitual} />;
        }
    };

    if (executingRitual) {
        return (
            <LaunchSequencePage 
                ritual={executingRitual}
                onComplete={() => {
                    // Pour l'instant, on revient au dashboard.
                    // Plus tard, on lancera le timer ici.
                    setExecutingRitual(null);
                }} 
            />
        );
    }

    return (
        <div className="app-layout" style={{ display: 'flex', width: '100%', height: '100vh' }}>
            <nav className="sidebar" style={{ width: '72px', backgroundColor: 'var(--bg-space)', borderRight: '1px solid var(--border-color)', padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div className="nav-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px', height: '100%' }}>
                    <button 
                        className={`nav-button ${currentPage === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setCurrentPage('dashboard')}
                        title="Rituals"
                        style={{ 
                            width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', color: currentPage === 'dashboard' ? 'white' : 'var(--text-secondary)',
                            display: 'grid', placeItems: 'center', cursor: 'pointer', transition: 'var(--transition-fast)', border: 'none', background: currentPage === 'dashboard' ? 'var(--accent-glow)' : 'none' 
                        }}
                    >
                        R
                    </button>
                    
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
                    
                    <button 
                        className="nav-button" 
                        onClick={handleLogout}
                        title="Déconnexion" 
                        style={{ marginTop: 'auto', width: '44px', height: '44px', borderRadius: 'var(--radius-lg)', color: 'var(--text-secondary)', display: 'grid', placeItems: 'center', cursor: 'pointer', border: 'none', background: 'none' }}
                    >
                        L
                    </button>
                </div>
            </nav>
            
            <main className="main-content" style={{ flexGrow: 1, overflowY: 'auto' }}>
                {renderPage()}
            </main>
        </div>
    );
}

export default AppLayout;