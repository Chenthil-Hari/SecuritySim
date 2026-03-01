import { useState, useEffect, useRef } from 'react';

/**
 * Hook for typewriter text animation
 * @param {string} text - Full text to animate
 * @param {number} speed - ms per character (higher = slower)
 * @param {number} delay - initial delay before typing starts (ms)
 * @returns {{ displayedText: string, isTyping: boolean, isDone: boolean }}
 */
export function useTypewriter(text, speed = 30, delay = 0) {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const timeoutRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        setDisplayedText('');
        setIsTyping(false);
        setIsDone(false);

        timeoutRef.current = setTimeout(() => {
            setIsTyping(true);
            let index = 0;

            intervalRef.current = setInterval(() => {
                if (index < text.length) {
                    setDisplayedText(text.slice(0, index + 1));
                    index++;
                } else {
                    setIsTyping(false);
                    setIsDone(true);
                    clearInterval(intervalRef.current);
                }
            }, speed);
        }, delay);

        return () => {
            clearTimeout(timeoutRef.current);
            clearInterval(intervalRef.current);
        };
    }, [text, speed, delay]);

    return { displayedText, isTyping, isDone };
}

/**
 * Hook for staggered reveal of array items
 * @param {Array} items - Array of items to reveal
 * @param {number} delayBetween - ms between each item reveal
 * @param {number} initialDelay - initial delay before first reveal
 * @returns {{ visibleCount: number, allRevealed: boolean }}
 */
export function useStaggeredReveal(items, delayBetween = 800, initialDelay = 500) {
    const [visibleCount, setVisibleCount] = useState(0);
    const [allRevealed, setAllRevealed] = useState(false);

    useEffect(() => {
        setVisibleCount(0);
        setAllRevealed(false);

        if (!items || items.length === 0) return;

        const timers = [];

        items.forEach((_, i) => {
            const timer = setTimeout(() => {
                setVisibleCount(i + 1);
                if (i === items.length - 1) {
                    setAllRevealed(true);
                }
            }, initialDelay + (i * delayBetween));
            timers.push(timer);
        });

        return () => timers.forEach(clearTimeout);
    }, [items, delayBetween, initialDelay]);

    return { visibleCount, allRevealed };
}
