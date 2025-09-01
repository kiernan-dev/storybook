import React from 'react';
import { useStory } from '../../hooks/useStory';
import { LOADING_STEPS } from '../../constants';

const LoadingView: React.FC = () => {
    const { state } = useStory();
    const currentStepText = LOADING_STEPS[state.loadingStep] || 'Finalizing...';

    return (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>
                Generating Your Story
            </h2>
            <p style={{ fontSize: '1rem', color: '#666' }}>
                {currentStepText}
            </p>
        </div>
    );
};

export default LoadingView;