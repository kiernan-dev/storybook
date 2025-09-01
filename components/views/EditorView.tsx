
import React, { useState } from 'react';
import { useStory } from '../../hooks/useStory';
import { Chapter, AppStep } from '../../types';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import { generateImageForChapter } from '../../services/geminiService';
import Spinner from '../ui/Spinner';

const ChapterEditor: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
    const { dispatch } = useStory();

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch({
            type: 'UPDATE_CHAPTER',
            payload: { chapterId: chapter.id, content: e.target.value },
        });
    };
    
    const handleGenerateImage = async () => {
        dispatch({ type: 'SET_GENERATING_IMAGE', payload: { chapterId: chapter.id, isGenerating: true } });
        try {
            const imageUrl = await generateImageForChapter(chapter.content);
            dispatch({ type: 'SET_IMAGE_URL', payload: { chapterId: chapter.id, url: imageUrl } });
        } catch (error) {
            console.error("Image generation failed", error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to generate image.' });
            dispatch({ type: 'SET_GENERATING_IMAGE', payload: { chapterId: chapter.id, isGenerating: false } });
        }
    };


    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div>
                <h3 className="text-xl font-semibold mb-2">{chapter.title}</h3>
                <Textarea
                    value={chapter.content}
                    onChange={handleContentChange}
                    className="h-96 text-base"
                />
            </div>
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="w-full aspect-square rounded-lg border border-dashed flex items-center justify-center bg-muted/40">
                    {chapter.isGeneratingImage ? (
                        <div className="flex flex-col items-center text-muted-foreground">
                            <Spinner className="h-8 w-8"/>
                            <p className="mt-2 text-sm">Illustrating scene...</p>
                        </div>
                    ) : chapter.imageUrl ? (
                        <img src={chapter.imageUrl} alt={`Illustration for ${chapter.title}`} className="object-cover w-full h-full rounded-lg" />
                    ) : (
                        <div className="text-center text-muted-foreground">
                            <p>No image generated yet.</p>
                        </div>
                    )}
                </div>
                <Button onClick={handleGenerateImage} disabled={chapter.isGeneratingImage} className="w-full">
                    {chapter.isGeneratingImage ? <><Spinner className="mr-2 h-4 w-4" /> Generating...</> : "Generate Illustration"}
                </Button>
            </div>
        </div>
    );
};


const EditorView: React.FC = () => {
    const { state, dispatch } = useStory();
    const [activeChapterId, setActiveChapterId] = useState<string | null>(state.story?.chapters[0]?.id || null);

    if (!state.story) {
        return <p>Loading story...</p>;
    }

    const activeChapter = state.story.chapters.find(ch => ch.id === activeChapterId);

    const goToPreview = () => {
        dispatch({ type: 'SET_STEP', payload: AppStep.PREVIEW });
    };

    return (
        <div className="flex flex-col md:flex-row gap-8 p-4 md:p-0">
            <aside className="w-full md:w-1/4 bg-card/50 rounded-lg p-6 border border-border/20">
                <h2 className="text-2xl font-bold mb-4">{state.story.title}</h2>
                <nav className="space-y-2">
                    {state.story.chapters.map(chapter => (
                        <button
                            key={chapter.id}
                            onClick={() => setActiveChapterId(chapter.id)}
                            className={`w-full text-left p-3 rounded-md transition-colors ${
                                activeChapterId === chapter.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-accent'
                            }`}
                        >
                            {chapter.title}
                        </button>
                    ))}
                </nav>
                 <Button onClick={goToPreview} className="w-full mt-8">
                    Go to Preview
                </Button>
            </aside>

            <main className="w-full md:w-3/4 bg-card/50 rounded-lg p-6 border border-border/20">
                {activeChapter ? (
                    <ChapterEditor chapter={activeChapter} />
                ) : (
                    <p>Select a chapter to begin editing.</p>
                )}
            </main>
        </div>
    );
};

export default EditorView;
