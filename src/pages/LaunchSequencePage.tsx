import { useEffect, useState, useRef } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import './LaunchSequencePage.css';

type Action = { type: string; target: string };
type Ritual = { name: string; actions: Action[] };
type ExecutionStatus = 'pending' | 'executing' | 'done' | 'error';

type LaunchSequencePageProps = {
    ritual: Ritual;
    onComplete: () => void;
};

function LaunchSequencePage({ ritual, onComplete }: LaunchSequencePageProps) {
    const [statuses, setStatuses] = useState<ExecutionStatus[]>(() => ritual.actions.map(() => 'pending'));
    const hasExecuted = useRef(false);

    useEffect(() => {
        if (hasExecuted.current) {
            return;
        }

        const execute = async () => {
            hasExecuted.current = true;

            for (let i = 0; i < ritual.actions.length; i++) {
                const action = ritual.actions[i];
                
                setStatuses(prev => {
                    const newStatuses = [...prev];
                    newStatuses[i] = 'executing';
                    return newStatuses;
                });

                if (action.type === 'delay') {
                    await new Promise(resolve => setTimeout(resolve, parseInt(action.target, 10) || 1000));
                } else {
                    try {
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
    }, [ritual, onComplete]);

    return (
        <div className="launch-overlay">
            <div className="launch-container">
                <h2>Launching: {ritual.name}</h2>
                <ul id="launch-actions-list">
                    {ritual.actions.map((action, index) => (
                        <li key={index} className={`launch-action-item ${statuses[index]}`}>
                            <div className="action-status">{statuses[index]}</div>
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