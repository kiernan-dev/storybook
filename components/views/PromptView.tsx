
import React, { useState, useEffect } from 'react';
import { useStory } from '../../hooks/useStory';
import { useStepTransition } from '../../hooks/useStepTransition';
import { generateStory } from '../../services/aiService';
import { isDemoMode } from '../../services/mockData';
import { AppStep, Genre, Audience } from '../../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Spinner from '../ui/Spinner';
import MagicPromptButton from '../ui/MagicPromptButton';
import { GENRE_OPTIONS, AUDIENCE_OPTIONS } from '../../constants';

const PromptView: React.FC = () => {
    const { state, dispatch } = useStory();
    const { transitionToStep } = useStepTransition();
    const [prompt, setPrompt] = useState('');
    const [genre, setGenre] = useState<Genre>(Genre.FANTASY);
    const [audience, setAudience] = useState<Audience>(Audience.CHILDREN);
    const [fieldErrors, setFieldErrors] = useState<{[key: string]: string}>({});
    const [isDemo, setIsDemo] = useState(isDemoMode());

    const handleGenreChange = (selectedGenre: Genre) => {
        setGenre(selectedGenre);
        // Auto-switch to appropriate audience if Romance is selected and current audience is inappropriate
        if (selectedGenre === Genre.ROMANCE && (audience === Audience.CHILDREN || audience === Audience.PRE_TEEN)) {
            setAudience(Audience.ADULT);
        }
        // Auto-switch to appropriate audience if Childrens Book is selected and current audience is inappropriate
        if (selectedGenre === Genre.CHILDREN && (audience === Audience.ADULT || audience === Audience.TEEN)) {
            setAudience(Audience.CHILDREN);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Clear previous errors
        setFieldErrors({});
        dispatch({ type: 'SET_ERROR', payload: null });
        
        // Validate form
        const errors: {[key: string]: string} = {};
        
        if (!prompt.trim()) {
            errors.prompt = 'Please enter a story idea or prompt to continue';
        }
        
        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            return;
        }

        dispatch({ type: 'SET_LOADING', payload: true });

        try {
            const generatedStory = await generateStory(prompt, genre, audience);
            const fullStory = {
                ...generatedStory,
                genre,
                audience,
            };
            dispatch({ type: 'SET_STORY', payload: fullStory });
            transitionToStep(AppStep.EDITING);
        } catch (err) {
            const error = err instanceof Error ? err.message : 'An unknown error occurred';
            dispatch({ type: 'SET_ERROR', payload: error });
        }
    };

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold mb-3">Create Your Story</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    Start by telling the AI what your story is about. The more detail, the better!
                </p>
            </div>
            
            <Card className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-8 p-8">
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label htmlFor="prompt" className={`text-base font-medium block ${fieldErrors.prompt ? 'text-destructive' : ''}`}>
                                    Story Prompt {fieldErrors.prompt && <span className="text-destructive">*</span>}
                                </label>
                                <div className="mt-4">
                                    <MagicPromptButton
                                        genre={genre}
                                        audience={audience}
                                        onPromptGenerated={(newPrompt) => {
                                            setPrompt(newPrompt);
                                            // Clear error when user adds content
                                            if (fieldErrors.prompt) {
                                                setFieldErrors(prev => ({ ...prev, prompt: '' }));
                                            }
                                        }}
                                        disabled={state.isLoading}
                                    />
                                </div>
                            </div>
                            <Textarea
                                id="prompt"
                                placeholder="e.g., A brave knight who is afraid of the dark..."
                                value={prompt}
                                onChange={(e) => {
                                    setPrompt(e.target.value);
                                    // Clear error when user starts typing
                                    if (fieldErrors.prompt && e.target.value.trim()) {
                                        setFieldErrors(prev => ({ ...prev, prompt: '' }));
                                    }
                                }}
                                rows={6}
                                disabled={state.isLoading}
                                className={`text-base resize-none ${
                                    fieldErrors.prompt 
                                        ? 'border-destructive focus:border-destructive focus:ring-destructive/20 bg-destructive/5' 
                                        : ''
                                }`}
                            />
                            {fieldErrors.prompt && (
                                <div className="flex items-center gap-2 text-sm text-destructive">
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    {fieldErrors.prompt}
                                </div>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label htmlFor="genre" className="text-base font-medium block">Genre</label>
                                <Select 
                                    id="genre" 
                                    value={genre} 
                                    onChange={(e) => handleGenreChange(e.target.value as Genre)} 
                                    disabled={state.isLoading}
                                    className="text-base"
                                >
                                    {GENRE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                                </Select>
                            </div>
                            <div className="space-y-3">
                                <label htmlFor="audience" className="text-base font-medium block">Target Audience</label>
                                <Select 
                                    id="audience" 
                                    value={audience} 
                                    onChange={(e) => setAudience(e.target.value as Audience)} 
                                    disabled={state.isLoading}
                                    className="text-base"
                                >
                                    {AUDIENCE_OPTIONS.map(a => (
                                        <option 
                                            key={a} 
                                            value={a}
                                            disabled={
                                                (genre === Genre.ROMANCE && (a === Audience.CHILDREN || a === Audience.PRE_TEEN)) ||
                                                (genre === Genre.CHILDREN && (a === Audience.ADULT || a === Audience.TEEN))
                                            }
                                        >
                                            {a}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                        
                        
                        <div className="pt-4">
                            <Button 
                                type="submit" 
                                className="w-full h-12 text-base font-medium" 
                                disabled={state.isLoading}
                            >
                                {state.isLoading ? (
                                    <>
                                        <Spinner className="mr-3 h-5 w-5" /> 
                                        {isDemoMode() ? 'Loading Demo Story...' : 'Generating Story...'}
                                    </>
                                ) : (
                                    isDemoMode() ? 'View Demo Story' : 'Generate Story'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </form>
            </Card>
        </div>
    );
};

export default PromptView;
