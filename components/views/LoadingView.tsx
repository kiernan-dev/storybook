import React from 'react';
import { useStory } from '../../hooks/useStory';
import { LOADING_STEPS } from '../../constants';

const LoadingView: React.FC = () => {
    const { state } = useStory();
    const currentStepText = LOADING_STEPS[state.loadingStep] || 'Finalizing...';
    const progress = ((state.loadingStep + 1) / LOADING_STEPS.length) * 100;

    return (
        <div className="rounded-lg border border-border/20 bg-card/50 p-8 backdrop-blur-sm">
            <div className="flex flex-col items-center justify-center text-center">
                <h2 className="text-2xl font-bold text-foreground mb-6">
                    Generating Your Story...
                </h2>
                <div className="w-full max-w-md bg-muted/50 rounded-full h-2.5 mb-4">
                    <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-500"
                        style={{ 
                            width: `${progress}%`,
                            boxShadow: `0 0 10px hsl(var(--primary)), 0 0 20px hsl(var(--primary) / 0.7)`
                        }}
                    />
                </div>
                <p className="text-sm text-muted-foreground italic">
                    {currentStepText}
                </p>
            </div>
        </div>
    );
};

export default LoadingView;
