// src/pages/SettingsPage.tsx
import './SettingsPage.css';

// Définitions de type minimales pour l'affichage statique
type Ritual = {
    id: number;
    name: string;
    description?: string;
    actions: { type: string, target: string }[];
};

// Données en dur pour l'affichage de la structure
const mockSettingsRituals: Ritual[] = [
    {
        id: 101,
        name: 'Morning Focus Ritual',
        description: 'Set up screen for deep work.',
        actions: [
            { type: 'Open URL', target: 'https://notion.so' },
            { type: 'Launch App', target: 'VS Code' },
            { type: 'Delay', target: '2000ms' },
            { type: 'Open Folder', target: '~/Projects/Cogniflow' },
        ]
    },
    {
        id: 102,
        name: 'Quick Cleanup',
        description: '',
        actions: [
            { type: 'Launch App', target: 'Spotify' },
        ]
    }
];

function SettingsPage() {
    return (
        <div className="dashboard-page"> {/* On réutilise la classe de base pour le padding */}
            <header className="page-header">
                <h1>Settings</h1>
                <p>Manage your rituals and the actions associated with them.</p>
            </header>

            <div className="settings-grid">
                {/* COLONNE DE CRÉATION DE FORMULAIRE */}
                <div className="settings-column">
                    <div className="settings-section">
                        <h3>Create a New Ritual</h3>
                        <div className="form-group">
                            <input type="text" id="new-ritual-name-input" placeholder="Ritual Name..." />
                        </div>
                        <div className="form-group">
                            <input type="text" id="new-ritual-description-input" placeholder="Description (optional)..." />
                        </div>
                        <button id="create-ritual-button" className="button button-primary" style={{ width: '100%' }}>
                            Create Ritual
                        </button>
                    </div>

                    <div className="settings-section">
                        <h3>Add an Action</h3>
                        <div className="form-row">
                            <select id="action-type-select">
                                <option value="open_url">Open URL</option>
                                <option value="open_app">Launch App</option>
                                <option value="open_folder">Open Folder</option>
                                <option value="open_file">Open File</option>
                                <option value="delay">Add Delay (ms)</option>
                            </select>
                            <input type="text" id="action-target-input" placeholder="Target (URL, path, or ms)..." style={{ flexGrow: 1 }} />
                        </div>
                        <div className="form-row">
                            <select id="add-to-ritual-select" title="Add to which ritual?">
                                {/* Ceci sera rempli dynamiquement plus tard */}
                                <option>-- Select Ritual --</option>
                            </select>
                            <button id="add-action-button" className="button button-primary">
                                Add Action
                            </button>
                        </div>
                    </div>
                </div>

                {/* COLONNE D'AFFICHAGE ET GESTION DES RITUELS EXISTANTS */}
                <div className="settings-column-large">
                    <div className="settings-section">
                        <h3>Existing Rituals ({mockSettingsRituals.length})</h3>
                        <div id="rituals-list">
                            {/* Affichage des rituels */}
                            {mockSettingsRituals.map(ritual => (
                                <div key={ritual.id} style={{marginBottom: '20px', border: '1px solid var(--border-color)', padding: '15px', borderRadius: 'var(--radius-md)'}}>
                                    <div className="ritual-header">
                                        <div className="ritual-header-title">
                                            <h3>{ritual.name}</h3>
                                            {ritual.description && <span className="ritual-description">{ritual.description}</span>}
                                        </div>
                                        <div className="ritual-header-buttons">
                                            {/* Icônes temporaires pour le visuel */}
                                            <button className="button-icon" title="Duplicate">
                                                <i data-lucide="copy">Copy</i>
                                            </button>
                                            <button className="button-icon" title="Edit">
                                                <i data-lucide="file-edit">Edit</i>
                                            </button>
                                            <button className="button-icon" title="Delete">
                                                <i data-lucide="trash-2">Delete</i>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    {/* Affichage des Actions */}
                                    {ritual.actions.length === 0 ? (
                                        <p style={{color: 'var(--text-secondary)', fontSize: '0.9em'}}>No actions defined.</p>
                                    ) : (
                                        ritual.actions.map((action, index) => (
                                            <div key={index} className="action-item">
                                                <div className="action-item-info">
                                                    <span>{action.type}</span> 
                                                    <span>{action.target}</span>
                                                </div>
                                                <div className="action-controls">
                                                    <button className="button-icon" title="Edit Action">Edit</button>
                                                    <button className="button-icon" title="Delete Action">X</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SettingsPage;