// src/components/EditRitualModal.tsx
import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import './EditRitualModal.css';

type Ritual = {
    id: number;
    name: string;
    description: string | null;
    actions: { type: string, target: string }[];
};

type EditRitualModalProps = {
    ritualToEdit: Ritual;
    onClose: () => void;
    onSave: () => void;
};

function EditRitualModal({ ritualToEdit, onClose, onSave }: EditRitualModalProps) {
    const [name, setName] = useState(ritualToEdit.name);
    const [description, setDescription] = useState(ritualToEdit.description || '');

    const handleSave = async () => {
        // ON AJOUTE LA VALIDATION ICI
        const trimmedName = name.trim();
        if (!trimmedName) {
            alert("Ritual name cannot be empty.");
            return; // On arrête l'exécution, la modale reste ouverte.
        }

        const { error } = await supabase
            .from('rituals')
            .update({ 
                name: trimmedName, // On sauvegarde la version sans espaces
                description: description.trim() || null 
            })
            .eq('id', ritualToEdit.id);

        if (error) {
            alert('Error updating ritual: ' + error.message);
        } else {
            onSave(); // On notifie le parent que la sauvegarde a réussi
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-container">
                <h3>Edit Ritual</h3>
                <div className="form-group">
                    <label htmlFor="edit-ritual-name">Ritual Name</label>
                    <input
                        id="edit-ritual-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="edit-ritual-description">Description</label>
                    <input
                        id="edit-ritual-description"
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
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

export default EditRitualModal;