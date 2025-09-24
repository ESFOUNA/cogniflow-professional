// src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './DashboardPage.css';

type Action = { type: string; target: string };
type Ritual = { id: number; name: string; description: string | null; actions: Action[] };

type DashboardPageProps = {
    onLaunchRitual: (ritual: Ritual) => void;
    sessionDuration: number;
    setSessionDuration: (duration: number) => void;
};

function DashboardPage({ onLaunchRitual, sessionDuration, setSessionDuration }: DashboardPageProps) {
    const [rituals, setRituals] = useState<Ritual[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRituals = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('rituals')
                    .select('id, name, description, actions')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true });

                if (error) {
                    console.error('Error fetching rituals:', error);
                } else if (data) {
                    setRituals(data);
                }
            }
            setLoading(false);
        };
        fetchRituals();
    }, []);

    if (loading) {
        return <div className="dashboard-page"><p style={{color: 'var(--text-primary)'}}>Loading rituals...</p></div>;
    }

    return (
        <div className="dashboard-page">
            <header className="page-header">
                <h1>Launch a Ritual</h1>
                <p>Choose a ritual to prepare your workspace and start a focus session.</p>
            </header>

            {/* NOUVEAU : Le sélecteur de durée */}
            <div className="session-duration-selector" style={{ marginBottom: '24px', backgroundColor: 'var(--bg-station)', padding: '16px', borderRadius: 'var(--radius-lg)' }}>
                <label htmlFor="session-duration" style={{ marginRight: '10px' }}>Session Duration:</label>
                <select 
                    id="session-duration"
                    value={sessionDuration}
                    onChange={(e) => setSessionDuration(Number(e.target.value))}
                >
                    <option value={1}>1 minute (Test)</option>
                    <option value={25}>25 minutes</option>
                    <option value={50}>50 minutes</option>
                    <option value={90}>90 minutes</option>
                </select>
            </div>

            <div className="rituals-container">
                {rituals.length === 0 ? (
                    <p style={{color: 'var(--text-primary)'}}>You don't have any rituals yet. Go to Settings to create one!</p>
                ) : (
                    rituals.map((ritual) => (
                        <div key={ritual.id} className="ritual-card" onClick={() => onLaunchRitual(ritual)}>
                            <h3>{ritual.name}</h3>
                            {ritual.description && <p>{ritual.description}</p>}
                            <p style={{marginTop: '10px', fontSize: '0.8em', color: 'var(--text-secondary)'}}>
                                {ritual.actions.length} Action(s)
                            </p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default DashboardPage;