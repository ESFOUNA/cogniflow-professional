// src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './DashboardPage.css';

type Action = { type: string; target: string };
type Ritual = { id: number; name: string; description: string | null; actions: Action[] };

// NOUVEAU : On définit les props que le composant reçoit
type DashboardPageProps = {
    onLaunchRitual: (ritual: Ritual) => void;
};

function DashboardPage({ onLaunchRitual }: DashboardPageProps) {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRituals = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('rituals')
          .select('id, name, description, actions')
          .eq('user_id', user.id);
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

  // On ajoute la fonction pour se déconnecter
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return <div className="dashboard-page"><p>Loading rituals...</p></div>;
  }

  return (
    <div className="dashboard-page">
      <header className="page-header">
        <h1>Launch a Ritual</h1>
        <p>Choose a ritual to prepare your workspace and start a focus session.</p>
        {/* On ajoute le bouton de déconnexion ici */}
        <button 
          onClick={handleSignOut} 
          style={{marginTop: '10px', cursor: 'pointer', padding: '8px 12px'}}
        >
          Sign Out
        </button>
      </header>

      <div className="rituals-container">
        {rituals.length === 0 ? (
          <p>You don't have any rituals yet. Go to Settings to create one!</p>
        ) : (
            rituals.map((ritual) => (
                // MISE À JOUR : Le onClick appelle maintenant la fonction du parent
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