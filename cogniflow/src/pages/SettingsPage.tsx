// src/pages/SettingsPage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './SettingsPage.css';

// Le type Ritual reste le même, mais on s'assure qu'il correspond à notre DB
type Ritual = {
    id: number;
    name: string;
    description: string | null;
    // Pour l'instant, les actions ne sont pas dans notre base de données,
    // donc nous allons les laisser vides.
    actions?: []; 
};

function SettingsPage() {
    // --- ÉTATS (STATES) ---
    // Pour stocker la liste des rituels de l'utilisateur
    const [rituals, setRituals] = useState<Ritual[]>([]);
    const [loading, setLoading] = useState(true);
    // Pour les champs du formulaire de création de rituel
    const [newRitualName, setNewRitualName] = useState('');
    const [newRitualDescription, setNewRitualDescription] = useState('');

    // --- FONCTION POUR ALLER CHERCHER LES DONNÉES ---
    const fetchRituals = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('rituals')
                .select('id, name, description')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true }); // On trie par date de création

            if (error) {
                console.error('Error fetching rituals:', error);
            } else if (data) {
                setRituals(data);
            }
        }
        setLoading(false);
    };

    // --- EFFET DE BORD (useEffect) ---
    // Cette fonction s'exécute une seule fois au chargement de la page
    useEffect(() => {
        fetchRituals();
    }, []); // Le tableau vide signifie "exécute-moi une seule fois"

    // --- FONCTIONS DE GESTION (HANDLERS) ---
    const handleCreateRitual = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !newRitualName.trim()) {
            alert('Ritual name cannot be empty.');
            return;
        }

        const { error } = await supabase
            .from('rituals')
            .insert({ 
                user_id: user.id, 
                name: newRitualName,
                description: newRitualDescription || null 
            });

        if (error) {
            alert('Error creating ritual: ' + error.message);
        } else {
            // Succès ! On vide les champs et on rafraîchit la liste
            setNewRitualName('');
            setNewRitualDescription('');
            fetchRituals(); // Très important : on met à jour la liste !
        }
    };

    const handleDeleteRitual = async (ritualId: number) => {
        // On demande confirmation avant une action destructive
        if (window.confirm('Are you sure you want to delete this ritual?')) {
            const { error } = await supabase
                .from('rituals')
                .delete()
                .eq('id', ritualId);
            
            if (error) {
                alert('Error deleting ritual: ' + error.message);
            } else {
                // Succès ! On rafraîchit la liste
                fetchRituals();
            }
        }
    };

    if (loading) {
        return <div className="dashboard-page"><p>Loading settings...</p></div>;
    }

    return (
        <div className="dashboard-page">
            <header className="page-header">
                <h1>Settings</h1>
                <p>Manage your rituals and the actions associated with them.</p>
            </header>

            <div className="settings-grid">
                {/* --- COLONNE DE CRÉATION --- */}
                <div className="settings-column">
                    <div className="settings-section">
                        <h3>Create a New Ritual</h3>
                        <div className="form-group">
                            <input 
                                type="text" 
                                placeholder="Ritual Name..." 
                                value={newRitualName}
                                onChange={(e) => setNewRitualName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <input 
                                type="text" 
                                placeholder="Description (optional)..." 
                                value={newRitualDescription}
                                onChange={(e) => setNewRitualDescription(e.target.value)}
                            />
                        </div>
                        <button onClick={handleCreateRitual} className="button button-primary" style={{ width: '100%' }}>
                            Create Ritual
                        </button>
                    </div>

                    <div className="settings-section">
                        <h3>Add an Action</h3>
                        {/* La logique pour ajouter des actions sera dans une prochaine tâche */}
                        <div className="form-row">
                            <select disabled>
                                <option>Open URL</option>
                            </select>
                            <input type="text" placeholder="Target..." disabled />
                        </div>
                        <div className="form-row">
                            <select title="Add to which ritual?" disabled={rituals.length === 0}>
                                {rituals.length === 0 ? (
                                    <option>-- Create a ritual first --</option>
                                ) : (
                                    rituals.map(r => <option key={r.id} value={r.id}>{r.name}</option>)
                                )}
                            </select>
                            <button className="button button-primary" disabled>Add Action</button>
                        </div>
                    </div>
                </div>

                {/* --- COLONNE D'AFFICHAGE --- */}
                <div className="settings-column-large">
                    <div className="settings-section">
                        <h3>Existing Rituals ({rituals.length})</h3>
                        <div id="rituals-list">
                            {rituals.length === 0 ? (
                                <p style={{color: 'var(--text-secondary)'}}>No rituals created yet.</p>
                            ) : (
                                rituals.map(ritual => (
                                    <div key={ritual.id} style={{marginBottom: '20px', border: '1px solid var(--border-color)', padding: '15px', borderRadius: 'var(--radius-md)'}}>
                                        <div className="ritual-header">
                                            <div className="ritual-header-title">
                                                <h3>{ritual.name}</h3>
                                                {ritual.description && <span className="ritual-description">{ritual.description}</span>}
                                            </div>
                                            <div className="ritual-header-buttons">
                                                <button className="button-icon" title="Duplicate" disabled>Copy</button>
                                                <button className="button-icon" title="Edit" disabled>Edit</button>
                                                <button onClick={() => handleDeleteRitual(ritual.id)} className="button-icon" title="Delete">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;