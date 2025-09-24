// src/pages/SettingsPage.tsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import EditRitualModal from '../components/EditRitualModal';
import EditActionModal from '../components/EditActionModal'; // Import the new modal
import { ask } from '@tauri-apps/api/dialog';
import './SettingsPage.css';

// --- TYPES ---
// Type plus précis pour nos Actions
type Action = {
    type: 'open_url' | 'open_app' | 'open_folder' | 'open_file' | 'delay';
    target: string;
};

type Ritual = {
    id: number;
    name: string;
    description: string | null;
    actions: Action[]; // Le type est maintenant un tableau d'objets Action
};

type EditingActionInfo = {
    ritualId: number;
    actionIndex: number;
    action: Action;
};

function SettingsPage() {
    // --- ÉTATS (STATES) ---
    const [rituals, setRituals] = useState<Ritual[]>([]);
    const [loading, setLoading] = useState(true);
    const [newRitualName, setNewRitualName] = useState('');
    const [newRitualDescription, setNewRitualDescription] = useState('');
    const [editingRitual, setEditingRitual] = useState<Ritual | null>(null);

    // NOUVEAUX ÉTATS pour le formulaire d'ajout d'action
    const [actionType, setActionType] = useState<Action['type']>('open_url');
    const [actionTarget, setActionTarget] = useState('');
    const [selectedRitualId, setSelectedRitualId] = useState<string>('');
    
    // Nouvel état pour la modale d'action
    const [editingAction, setEditingAction] = useState<EditingActionInfo | null>(null);

    // --- FONCTION POUR ALLER CHERCHER LES DONNÉES ---
    const fetchRituals = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('rituals')
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
        const confirmed = await ask(
            'Are you sure you want to delete this ritual? This action cannot be undone.', 
            { title: 'Confirm Deletion', type: 'warning' }
        );
    
        if (confirmed) {
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

    // --- NOUVELLE FONCTION : handleAddAction ---
    const handleAddAction = async () => {
        if (!selectedRitualId || !actionTarget.trim()) {
            alert('Please select a ritual and provide a target.');
            return;
        }

        // 1. Trouver le rituel à mettre à jour dans notre état local
        const ritualToUpdate = rituals.find(r => r.id === parseInt(selectedRitualId));
        if (!ritualToUpdate) return;

        // 2. Créer la nouvelle action
        const newAction: Action = {
            type: actionType,
            target: actionTarget,
        };

        // 3. Préparer le nouveau tableau d'actions
        const updatedActions = [...ritualToUpdate.actions, newAction];

        // 4. Envoyer la mise à jour à Supabase
        const { error } = await supabase
            .from('rituals')
            .update({ actions: updatedActions }) // On met à jour la colonne 'actions'
            .eq('id', selectedRitualId);

        if (error) {
            alert('Error adding action: ' + error.message);
        } else {
            // 5. Succès ! On vide les champs et on rafraîchit la liste
            setActionTarget('');
            fetchRituals();
        }
    };

    // --- NOUVELLE FONCTION : handleDeleteAction ---
    const handleDeleteAction = async (ritualId: number, actionIndex: number) => {
        const confirmed = await ask(
            'Are you sure you want to delete this action?', 
            { title: 'Confirm Action Deletion', type: 'warning' }
        );
    
        if (confirmed) {
            const ritualToUpdate = rituals.find(r => r.id === ritualId);
            if (!ritualToUpdate) return;
    
            const updatedActions = ritualToUpdate.actions.filter((_, index) => index !== actionIndex);
    
            const { error } = await supabase
                .from('rituals')
                .update({ actions: updatedActions })
                .eq('id', ritualId);
            
            if (error) {
                alert('Error deleting action: ' + error.message);
            } else {
                fetchRituals();
            }
        }
    };

    // --- NOUVELLE FONCTION : handleSaveAction ---
    const handleSaveAction = async (updatedAction: Action) => {
        if (!editingAction) return;

        const { ritualId, actionIndex } = editingAction;
        const ritualToUpdate = rituals.find(r => r.id === ritualId);
        if (!ritualToUpdate) return;

        const updatedActions = [...ritualToUpdate.actions];
        updatedActions[actionIndex] = updatedAction;
        
        const { error } = await supabase
            .from('rituals')
            .update({ actions: updatedActions })
            .eq('id', ritualId);

        if (error) {
            alert('Error updating action: ' + error.message);
        } else {
            setEditingAction(null);
            fetchRituals();
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

                    {/* SECTION "ADD AN ACTION" - MISE À JOUR COMPLÈTE */}
                    <div className="settings-section">
                        <h3>Add an Action</h3>
                        <div className="form-row">
                            <select 
                                value={actionType}
                                onChange={(e) => setActionType(e.target.value as Action['type'])}
                            >
                                <option value="open_url">Open URL</option>
                                <option value="open_app">Launch App</option>
                                <option value="open_folder">Open Folder</option>
                                <option value="open_file">Open File</option>
                                <option value="delay">Add Delay (ms)</option>
                            </select>
                            <input 
                                type="text" 
                                placeholder="Target (URL, path, or ms)..."
                                value={actionTarget}
                                onChange={(e) => setActionTarget(e.target.value)}
                            />
                        </div>
                        <div className="form-row">
                            <select 
                                title="Add to which ritual?" 
                                value={selectedRitualId}
                                onChange={(e) => setSelectedRitualId(e.target.value)}
                                disabled={rituals.length === 0}
                            >
                                <option value="">-- Select Ritual --</option>
                                {rituals.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                            <button 
                                onClick={handleAddAction} 
                                className="button button-primary"
                                disabled={rituals.length === 0}
                            >
                                Add Action
                            </button>
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
                                        
                                        {/* AFFICHAGE DES ACTIONS */}
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
                                                        <button 
                                                            onClick={() => setEditingAction({ ritualId: ritual.id, actionIndex: index, action: action })}
                                                            className="button-icon" 
                                                            title="Edit Action"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteAction(ritual.id, index)} 
                                                            className="button-icon" 
                                                            title="Delete Action"
                                                        >
                                                            X
                                                        </button>
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

            {/* --- AFFICHAGE DE LA MODALE RITUAL --- */}
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

            {/* --- AFFICHAGE DE LA MODALE ACTION --- */}
            {editingAction && (
                <EditActionModal 
                    actionToEdit={editingAction.action}
                    onClose={() => setEditingAction(null)}
                    onSave={handleSaveAction}
                />
            )}
        </div>
    );
}

export default SettingsPage;