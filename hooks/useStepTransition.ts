import { useState } from 'react';
import { useStory } from './useStory';
import { AppStep } from '../types';

export const useStepTransition = () => {
    const { state, dispatch, saveCurrentStory } = useStory();
    const [isTransitioning, setIsTransitioning] = useState(false);

    const transitionToStep = async (newStep: AppStep) => {
        if (isTransitioning || state.step === newStep) return;

        setIsTransitioning(true);

        try {
            // Auto-save current story before transitioning (if story exists and we're moving forward)
            if (state.story && newStep > state.step) {
                console.log('Auto-saving before step transition...');
                await saveCurrentStory();
            }

            // Add a slight delay for smooth animation
            await new Promise(resolve => setTimeout(resolve, 200));

            // Perform the step transition
            dispatch({ type: 'SET_STEP', payload: newStep });

            // Wait for animation to complete
            await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
            console.error('Error during step transition:', error);
            // Continue with transition even if save fails
            dispatch({ type: 'SET_STEP', payload: newStep });
        } finally {
            setIsTransitioning(false);
        }
    };

    return {
        transitionToStep,
        isTransitioning,
        currentStep: state.step
    };
};