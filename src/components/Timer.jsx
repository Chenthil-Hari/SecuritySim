import { useState, useEffect, useRef } from 'react';
import './Timer.css';

export default function Timer({ seconds, onTimeout, isPaused = false }) {
    const [timeLeft, setTimeLeft] = useState(seconds);
    const intervalRef = useRef(null);
    const hasTimedOut = useRef(false);

    useEffect(() => {
        setTimeLeft(seconds);
        hasTimedOut.current = false;
    }, [seconds]);

    useEffect(() => {
        if (isPaused || timeLeft <= 0) {
            clearInterval(intervalRef.current);
            if (timeLeft <= 0 && !hasTimedOut.current) {
                hasTimedOut.current = true;
                onTimeout?.();
            }
            return;
        }

        intervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(intervalRef.current);
    }, [isPaused, timeLeft, onTimeout]);

    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const progress = timeLeft / seconds;
    const dashOffset = circumference * (1 - progress);
    const isWarning = progress <= 0.25;
    const isCritical = progress <= 0.1;

    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    const display = mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`;

    return (
        <div className={`timer-container ${isWarning ? 'warning' : ''} ${isCritical ? 'critical' : ''}`}>
            <svg className="timer-svg" viewBox="0 0 80 80">
                <circle className="timer-track" cx="40" cy="40" r={radius} />
                <circle
                    className="timer-progress"
                    cx="40"
                    cy="40"
                    r={radius}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                />
            </svg>
            <div className="timer-text">{display}</div>
        </div>
    );
}
