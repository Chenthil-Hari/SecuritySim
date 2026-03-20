/**
 * Global Framer Motion Variants for Tactical UI
 * Uses spring physics for a high-end, smooth feel.
 */

// Staggered Container for children
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren,
            delayChildren
        }
    }
});

// Simple Fade and Slide Up
export const fadeInDown = {
    hidden: { opacity: 0, y: -20 },
    show: { 
        opacity: 1, 
        y: 0,
        transition: {
            type: 'spring',
            duration: 0.8,
            bounce: 0.4
        }
    }
};

export const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { 
        opacity: 1, 
        y: 0,
        transition: {
            type: 'spring',
            duration: 0.8,
            bounce: 0.4
        }
    }
};

// Subtle Scale Up for cards
export const springScale = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { 
        opacity: 1, 
        scale: 1,
        transition: {
            type: 'spring',
            duration: 0.6,
            bounce: 0.5
        }
    }
};

// Tactical Hover Effects
export const tacticalTap = {
    scale: 0.98,
    filter: 'brightness(0.9)',
    transition: { duration: 0.1 }
};

export const tacticalHover = (color = '#00f0ff') => ({
    scale: 1.02,
    boxShadow: `0 0 20px ${color}33`,
    borderColor: color,
    transition: { type: 'spring', stiffness: 400, damping: 10 }
});

// Page Transitions
export const pageTransition = {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
    transition: { duration: 0.3 }
};
