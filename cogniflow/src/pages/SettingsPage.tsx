// src/pages/SettingsPage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import EditRitualModal from '../components/EditRitualModal';
import './SettingsPage.css';

// 1. MISE À JOUR DU TYPE POUR INCLURE LES ACTIONS
type Action = {
    type: string;
    target: string;
};

type Ritual = {
    id: number;
    name: string;
    description: string | null;
    actions: Action[]; // Le type est maintenant un tableau d'objets Action
};

function SettingsPage() {
    // --- ÉTATS (STATES) ---
    const [rituals, setRituals] = useState<Ritual[]>([]);
    const [loading, setLoading] = useState(true);
    const [newRitualName, setNewRitualName] = useState('');
    const [newRitualDescription, setNewRitualDescription] = useState('');
    const [editingRitual, setEditingRitual] = useState<Ritual | null>(null);

    // --- FONCTION POUR ALLER CHERCHER LES DONNÉES ---
    const fetchRituals = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('rituals')
                // 2. MISE À JOUR DE LA REQUÊTE
                .select('id, name, description, actions') // On récupère aussi la colonne 'actions'
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

    // --- EFFET DE BORD (useEffect) ---
    useEffect(() => {
        fetchRituals();
    }, []);

    // --- FONCTIONS DE GESTION (HANDLERS) ---
    const handleCreateRitual = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !newRitualName.trim()) {
            alert('Ritual name cannot be empty.');
            return;
        }
        // Pas besoin de spécifier 'actions' ici, car la DB lui donnera la valeur par défaut '[]'
        const { error } = await supabase
            .from('rituals')
            .insert({ 
                user_id: user.id, 
                name: newRitualName,
                description: newRitualDescription || null,
                actions : []
            });
        if (error) {
            alert('Error creating ritual: ' + error.message);
        } else {
            setNewRitualName('');
            setNewRitualDescription('');
            fetchRituals();
        }
    };

    const handleDeleteRitual = async (ritualId: number) => {
        if (window.confirm('Are you sure you want to delete this ritual?')) {
            const { error } = await supabase
                .from('rituals')
                .delete()
                .eq('id', ritualId);
            if (error) {
                alert('Error deleting ritual: ' + error.message);
            } else {
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
                                                <button 
                                                    onClick={() => setEditingRitual(ritual)} 
                                                    className="button-icon" 
                                                    title="Edit"
                                                >
                                                    Edit
                                                </button>
                                                <button onClick={() => handleDeleteRitual(ritual.id)} className="button-icon" title="Delete">Delete</button>
                                            </div>
                                        </div>
                                        
                                        {/* 3. MISE À JOUR DE L'AFFICHAGE DES ACTIONS */}
                                        {ritual.actions.length === 0 ? (
                                            <p style={{color: 'var(--text-secondary)', fontSize: '0.9em', paddingLeft: '10px'}}>No actions defined.</p>
                                        ) : (
                                            ritual.actions.map((action, index) => (
                                                <div key={index} className="action-item">
                                                    <div className="action-item-info">
                                                        <span>{action.type}</span> 
                                                        <span>{action.target}</span>
                                                    </div>
                                                    <div className="action-controls">
                                                        <button className="button-icon" title="Edit Action" disabled>Edit</button>
                                                        <button className="button-icon" title="Delete Action" disabled>X</button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- AFFICHAGE DE LA MODALE --- */}
            {editingRitual && (
                <EditRitualModal
                    ritualToEdit={editingRitual}
                    onClose={() => setEditingRitual(null)}
                    onSave={() => {
                        setEditingRitual(null);
                        fetchRituals();
                    }}
                />
            )}
        </div>
    );
}

export default SettingsPage;