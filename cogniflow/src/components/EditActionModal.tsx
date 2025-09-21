// src/components/EditActionModal.tsx
import { useState } from 'react';
import './EditActionModal.css';

type Action = {
    type: 'open_url' | 'open_app' | 'open_folder' | 'open_file' | 'delay';
    target: string;
};

type EditActionModalProps = {
    actionToEdit: Action;
    onClose: () => void;
    onSave: (updatedAction: Action) => void; // On va renvoyer l'action modifiée au parent
};

function EditActionModal({ actionToEdit, onClose, onSave }: EditActionModalProps) {
    const [actionType, setActionType] = useState<Action['type']>(actionToEdit.type);
    const [actionTarget, setActionTarget] = useState(actionToEdit.target);

    const handleSave = () => {
        const updatedAction: Action = {
            type: actionType,
            target: actionTarget,
        };
        onSave(updatedAction);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3>Edit Action</h3>
                <div className="form-group">
                    <label>Action Type</label>
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
                </div>
                <div className="form-group">
                    <label>Target</label>
                    <input
                        type="text"
                        value={actionTarget}
                        onChange={(e) => setActionTarget(e.target.value)}
                    />
                </div>
                <div className="modal-buttons">
                    <button className="button" onClick={onClose}>Cancel</button>
                    <button className="button button-primary" onClick={handleSave}>Save Changes</button>
                </div>
            </div>
        </div>
    );
}

export default EditActionModal;