
import React, { createContext, useReducer, Dispatch, useEffect, ReactNode } from 'react';
import { AppState, Action, AppStep, Story } from '../types';

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
            return { ...state, isLoading: action.payload };
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
        default:
            return state;
    }
};

export const StoryContext = createContext<{
    state: AppState;
    dispatch: Dispatch<Action>;
}>({
    state: initialState,
    dispatch: () => null,
});

export const StoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(storyReducer, initialState);

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

    return (
        <StoryContext.Provider value={{ state, dispatch }}>
            {children}
        </StoryContext.Provider>
    );
};
