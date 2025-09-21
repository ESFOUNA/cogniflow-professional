// src/pages/LaunchSequencePage.tsx
import { useEffect, useState, useRef } from 'react'; // 1. On importe 'useRef'
import { invoke } from '@tauri-apps/api/tauri';
import './LaunchSequencePage.css';

type Action = { type: string; target: string };
type Ritual = { name: string; actions: Action[] };
type ExecutionStatus = 'pending' | 'executing' | 'done';

type LaunchSequencePageProps = {
    ritual: Ritual;
    onComplete: () => void;
};

function LaunchSequencePage({ ritual, onComplete }: LaunchSequencePageProps) {
    const [statuses, setStatuses] = useState<ExecutionStatus[]>(() => ritual.actions.map(() => 'pending'));

    // 2. On crée une "ref". C'est comme une variable d'instance qui survit aux re-rendus.
    // On l'utilise comme un drapeau pour savoir si l'exécution a déjà commencé.
    const hasExecuted = useRef(false);

    useEffect(() => {
        // 3. On ajoute une condition de garde.
        // Si l'exécution a déjà commencé (hasExecuted.current est true), on ne fait RIEN.
        if (hasExecuted.current) {
            return;
        }

        const execute = async () => {
            // 4. On lève le drapeau. Même si React relance cet effet, la condition
            //    de garde ci-dessus l'empêchera de continuer.
            hasExecuted.current = true;

            for (let i = 0; i < ritual.actions.length; i++) {
                const action = ritual.actions[i];
                
                setStatuses(prev => {
                    const newStatuses = [...prev];
                    newStatuses[i] = 'executing';
                    return newStatuses;
                });

                if (action.type === 'delay') {
                    // La logique du délai ne change pas.
                    await new Promise(resolve => setTimeout(resolve, parseInt(action.target, 10) || 1000));
                } else {
                    try {
                        // La logique d'appel à Rust ne change pas.
                        await invoke('execute_action', { target: action.target });
                    } catch (err) {
                        console.error("Failed to execute action:", action, err);
                        alert(`Error executing action "${action.target}": ${err}`);
                    }
                }
                
                setStatuses(prev => {
                    const newStatuses = [...prev];
                    newStatuses[i] = 'done';
                    return newStatuses;
                });
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
            onComplete();
        };

        execute();
        
    // On garde les dépendances originales, mais notre logique interne nous protège.
    }, [ritual, onComplete]);

    return (
        <div className="launch-overlay">
            <div className="launch-container">
                <h2>Launching: {ritual.name}</h2>
                <ul id="launch-actions-list">
                    {ritual.actions.map((action, index) => (
                        <li key={index} className={`launch-action-item ${statuses[index]}`}>
                            <div>[{statuses[index]}]</div>
                            <div className="action-text">
                                <span className="action-type">{action.type}</span>
                                <span className="action-target">{action.target}</span>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default LaunchSequencePage;