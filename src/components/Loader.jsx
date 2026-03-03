import React from 'react';
import './Loader.css';

const Loader = () => {
    return (
        <div className="loader-container">
            <video
                className="loader-video"
                src="/loading-animation.webm"
                autoPlay
                loop
                muted
                playsInline
            />
        </div>
    );
};

export default Loader;
