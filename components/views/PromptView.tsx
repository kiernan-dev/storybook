
import React, { useState } from 'react';
import { useStory } from '../../hooks/useStory';
import { useStepTransition } from '../../hooks/useStepTransition';
import { generateStory } from '../../services/geminiService';
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
        if (!prompt.trim()) {
            dispatch({ type: 'SET_ERROR', payload: 'Prompt cannot be empty.' });
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
                                <label htmlFor="prompt" className="text-base font-medium block">Story Prompt</label>
                                <div className="mt-4">
                                    <MagicPromptButton
                                        genre={genre}
                                        audience={audience}
                                        onPromptGenerated={setPrompt}
                                        disabled={state.isLoading}
                                    />
                                </div>
                            </div>
                            <Textarea
                                id="prompt"
                                placeholder="e.g., A brave knight who is afraid of the dark..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={6}
                                disabled={state.isLoading}
                                className="text-base resize-none"
                            />
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
                        
                        {state.error && (
                            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                                <p className="text-sm text-destructive font-medium">{state.error}</p>
                            </div>
                        )}
                        
                        <div className="pt-4">
                            <Button 
                                type="submit" 
                                className="w-full h-12 text-base font-medium" 
                                disabled={state.isLoading}
                            >
                                {state.isLoading ? (
                                    <>
                                        <Spinner className="mr-3 h-5 w-5" /> Generating Story...
                                    </>
                                ) : (
                                    'Generate Story'
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
