// src/pages/SettingsPage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import EditRitualModal from '../components/EditRitualModal'; // 1. ON IMPORTE LA NOUVELLE MODALE
import './SettingsPage.css';

type Ritual = {
    id: number;
    name: string;
    description: string | null;
    actions?: []; 
};

function SettingsPage() {
    // --- ÉTATS (STATES) ---
    // Pas de changement ici
    const [rituals, setRituals] = useState<Ritual[]>([]);
    const [loading, setLoading] = useState(true);
    const [newRitualName, setNewRitualName] = useState('');
    const [newRitualDescription, setNewRitualDescription] = useState('');
    
    // 2. ON AJOUTE UN NOUVEL ÉTAT POUR GÉRER LA MODALE
    // S'il est 'null', la modale est cachée.
    // S'il contient un rituel, la modale s'affiche avec les données de ce rituel.
    const [editingRitual, setEditingRitual] = useState<Ritual | null>(null);

    // --- FONCTION POUR ALLER CHERCHER LES DONNÉES ---
    // Pas de changement ici
    const fetchRituals = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('rituals')
                .select('id, name, description')
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
    // Pas de changement ici
    useEffect(() => {
        fetchRituals();
    }, []);

    // --- FONCTIONS DE GESTION (HANDLERS) ---
    // Pas de changement sur les fonctions existantes
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
                {/* --- COLONNE DE CRÉATION --- (Pas de changement ici) */}
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
                                                {/* 3. ON ACTIVE LE BOUTON "EDIT" ET ON LUI DONNE UNE ACTION */}
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
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. ON AJOUTE LA LOGIQUE D'AFFICHAGE DE LA MODALE */}
            {/* Si 'editingRitual' contient un rituel, on affiche le composant Modal */}
            {editingRitual && (
                <EditRitualModal
                    ritualToEdit={editingRitual}
                    onClose={() => setEditingRitual(null)} // La fonction pour fermer la modale
                    onSave={() => {
                        setEditingRitual(null); // On ferme la modale
                        fetchRituals();      // Et on rafraîchit la liste pour voir les changements
                    }}
                />
            )}
        </div>
    );
}

export default SettingsPage;