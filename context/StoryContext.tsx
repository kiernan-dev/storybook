
import React, { createContext, useReducer, Dispatch, useEffect, ReactNode } from 'react';
import { AppState, Action, AppStep, Story } from '../types';
import { saveStory } from '../services/database';

const initialState: AppState = {
    story: null,
    step: AppStep.PROMPT,
    isLoading: false,
    error: null,
    theme: 'flash-era',
};

const storyReducer = (state: AppState, action: Action): AppState => {
    switch (action.type) {
        case 'SET_STORY':
            return { ...state, story: action.payload, isLoading: false, error: null };
        case 'SET_STEP':
            return { ...state, step: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload, error: null };
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false };
        case 'UPDATE_CHAPTER':
            if (!state.story) return state;
            const updatedChapters = state.story.chapters.map(ch =>
                ch.id === action.payload.chapterId ? { ...ch, content: action.payload.content } : ch
            );
            return { ...state, story: { ...state.story, chapters: updatedChapters } };
        case 'SET_GENERATING_IMAGE':
             if (!state.story) return state;
            return {
                ...state,
                story: {
                    ...state.story,
                    chapters: state.story.chapters.map(ch =>
                        ch.id === action.payload.chapterId ? { ...ch, isGeneratingImage: action.payload.isGenerating } : ch
                    )
                }
            };
        case 'SET_IMAGE_URL':
            if (!state.story) return state;
            return {
                ...state,
                story: {
                    ...state.story,
                    chapters: state.story.chapters.map(ch =>
                        ch.id === action.payload.chapterId ? { ...ch, imageUrl: action.payload.url, isGeneratingImage: false } : ch
                    )
                }
            };
        case 'SET_THEME':
            localStorage.setItem('theme', action.payload);
            return { ...state, theme: action.payload };
        case 'SAVE_STORY_SUCCESS':
            return { ...state };
        default:
            return state;
    }
};

export const StoryContext = createContext<{
    state: AppState;
    dispatch: Dispatch<Action>;
    saveCurrentStory: (story?: Story) => Promise<number | null>;
}>({
    state: initialState,
    dispatch: () => null,
    saveCurrentStory: async () => null,
});

export const StoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(storyReducer, initialState);

    const saveCurrentStory = async (storyToSave?: Story): Promise<number | null> => {
        const story = storyToSave || state.story;
        if (!story) {
            console.warn('No story to save');
            return null;
        }

        try {
            const storyId = await saveStory(story);
            
            // Update the story with the ID if it's a new story
            if (!story.id) {
                dispatch({ type: 'SET_STORY', payload: { ...story, id: storyId } });
            }
            
            dispatch({ type: 'SAVE_STORY_SUCCESS', payload: { storyId } });
            return storyId;
        } catch (error) {
            console.error('Failed to save story:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to save story. Please try again.' });
            return null;
        }
    };

    useEffect(() => {
        const localTheme = localStorage.getItem('theme') as AppState['theme'] | null;
        if (localTheme) {
            dispatch({ type: 'SET_THEME', payload: localTheme });
        }
    }, []);

    useEffect(() => {
        // Remove all theme classes
        document.documentElement.classList.remove('flash-era', 'flash-era-light');
        
        if (state.theme === 'flash-era') {
            document.documentElement.classList.add('flash-era');
        } else if (state.theme === 'flash-era-light') {
            document.documentElement.classList.add('flash-era-light');
        }
    }, [state.theme]);

    // Auto-save when user reaches preview step
    useEffect(() => {
        if (state.step === AppStep.PREVIEW && state.story && !state.isLoading) {
            console.log('Auto-saving story on preview...');
            saveCurrentStory(state.story);
        }
    }, [state.step, state.story, state.isLoading]);

    return (
        <StoryContext.Provider value={{ state, dispatch, saveCurrentStory }}>
            {children}
        </StoryContext.Provider>
    );
};
