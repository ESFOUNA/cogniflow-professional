// src/pages/FocusSessionPage.tsx
import { useState, useEffect } from 'react';
import { ask } from '@tauri-apps/api/dialog';
import './FocusSessionPage.css';

type FocusSessionPageProps = {
    ritualName: string;
    durationInMinutes: number;
    onStop: () => void;
};

function FocusSessionPage({ ritualName, durationInMinutes, onStop }: FocusSessionPageProps) {
    // On convertit les minutes en secondes pour le décompte
    const [secondsLeft, setSecondsLeft] = useState(durationInMinutes * 60);
    // État pour gérer la pause
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        // Si le timer est en pause ou terminé, on ne fait rien
        if (isPaused || secondsLeft <= 0) {
            return;
        }

        // On crée un intervalle qui s'exécute toutes les secondes
        const timerInterval = setInterval(() => {
            setSecondsLeft(prevSeconds => prevSeconds - 1);
        }, 1000);

        // La fonction de nettoyage est cruciale : elle arrête l'intervalle
        // quand le composant est détruit ou quand l'état change.
        return () => clearInterval(timerInterval);

    }, [secondsLeft, isPaused]); // L'effet se relance si ces valeurs changent

    const handlePauseResume = () => {
        setIsPaused(prev => !prev); // On inverse l'état de pause
    };

    const handleStop = async () => {
        const confirmed = await ask('Are you sure you want to stop this focus session?', {
            title: 'Confirm Stop',
            type: 'warning'
        });
        if (confirmed) {
            onStop(); // On appelle la fonction du parent pour revenir en arrière
        }
    };

    // Fonctions pour formater le temps en MM:SS
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    return (
        <div className="focus-session-page">
            <h2 className="ritual-name-display">{ritualName}</h2>
            <div className="timer-container">
                <div className="timer-display">{secondsLeft <= 0 ? "Done!" : formattedTime}</div>
            </div>
            <div className="session-controls">
                <button className="button" onClick={handlePauseResume}>
                    {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button className="button button-danger" onClick={handleStop}>Stop</button>
            </div>
        </div>
    );
}

export default FocusSessionPage;