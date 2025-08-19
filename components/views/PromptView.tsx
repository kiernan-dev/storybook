
import React, { useState } from 'react';
import { useStory } from '../../hooks/useStory';
import { generateStory } from '../../services/geminiService';
import { AppStep, Genre, Audience } from '../../types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import Select from '../ui/Select';
import Spinner from '../ui/Spinner';
import { GENRE_OPTIONS, AUDIENCE_OPTIONS } from '../../constants';

const PromptView: React.FC = () => {
    const { state, dispatch } = useStory();
    const [prompt, setPrompt] = useState('');
    const [genre, setGenre] = useState<Genre>(Genre.FANTASY);
    const [audience, setAudience] = useState<Audience>(Audience.CHILDREN);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) {
            dispatch({ type: 'SET_ERROR', payload: 'Prompt cannot be empty.' });
            return;
        }

        dispatch({ type: 'SET_LOADING', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });

        try {
            const story = await generateStory(prompt, genre, audience);
            dispatch({ type: 'SET_STORY', payload: story });
            dispatch({ type: 'SET_STEP', payload: AppStep.EDITING });
        } catch (err) {
            const error = err instanceof Error ? err.message : 'An unknown error occurred';
            dispatch({ type: 'SET_ERROR', payload: error });
        }
    };

    return (
        <Card className="max-w-3xl mx-auto">
            <CardHeader>
                <CardTitle>Create Your Story</CardTitle>
                <CardDescription>Start by telling the AI what your story is about. The more detail, the better!</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="prompt" className="text-sm font-medium">Story Prompt</label>
                        <Textarea
                            id="prompt"
                            placeholder="e.g., A brave knight who is afraid of the dark..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={5}
                            disabled={state.isLoading}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="genre" className="text-sm font-medium">Genre</label>
                            <Select id="genre" value={genre} onChange={(e) => setGenre(e.target.value as Genre)} disabled={state.isLoading}>
                                {GENRE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="audience" className="text-sm font-medium">Target Audience</label>
                            <Select id="audience" value={audience} onChange={(e) => setAudience(e.target.value as Audience)} disabled={state.isLoading}>
                                {AUDIENCE_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                            </Select>
                        </div>
                    </div>
                    {state.error && <p className="text-sm text-destructive">{state.error}</p>}
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={state.isLoading}>
                        {state.isLoading ? (
                            <>
                                <Spinner className="mr-2 h-4 w-4" /> Generating Story...
                            </>
                        ) : (
                            'Generate Story'
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
};

export default PromptView;
