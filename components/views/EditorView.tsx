
import React, { useState, useRef } from 'react';
import { useStory } from '../../hooks/useStory';
import { useStepTransition } from '../../hooks/useStepTransition';
import { Chapter, AppStep } from '../../types';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';
import { generateImageForChapter } from '../../services/geminiService';
import Spinner from '../ui/Spinner';

const ChapterEditor: React.FC<{ chapter: Chapter }> = ({ chapter }) => {
    const { dispatch, saveCurrentStory } = useStory();
    const originalContentRef = useRef(chapter.content);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        dispatch({
            type: 'UPDATE_CHAPTER',
            payload: { chapterId: chapter.id, content: e.target.value },
        });
    };

    const handleTextBlur = async () => {
        // Auto-save only if content has changed
        if (chapter.content !== originalContentRef.current) {
            try {
                await saveCurrentStory();
                originalContentRef.current = chapter.content; // Update reference after successful save
                console.log('Auto-saved after text change');
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }
    };
    
    const handleGenerateImage = async () => {
        dispatch({ type: 'SET_GENERATING_IMAGE', payload: { chapterId: chapter.id, isGenerating: true } });
        try {
            const imageUrl = await generateImageForChapter(chapter.content);
            dispatch({ type: 'SET_IMAGE_URL', payload: { chapterId: chapter.id, url: imageUrl } });
            
            // Auto-save after successful image generation
            try {
                await saveCurrentStory();
                console.log('Auto-saved after image generation');
            } catch (saveError) {
                console.error('Auto-save failed after image generation:', saveError);
            }
        } catch (error) {
            console.error("Image generation failed", error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to generate image.' });
            dispatch({ type: 'SET_GENERATING_IMAGE', payload: { chapterId: chapter.id, isGenerating: false } });
        }
    };


    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">{chapter.title}</h3>
            
            {/* Mobile-optimized layout */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
                {/* Content editor */}
                <div className="order-2 lg:order-1">
                    <Textarea
                        value={chapter.content}
                        onChange={handleContentChange}
                        onBlur={handleTextBlur}
                        className="h-32 sm:h-40 lg:h-64 text-sm resize-none"
                        placeholder="Edit your chapter content..."
                    />
                </div>
                
                {/* Image area - more compact for mobile */}
                <div className="order-1 lg:order-2 flex flex-col space-y-3">
                    <div className="w-full h-32 sm:h-40 lg:h-48 lg:aspect-square rounded-lg border border-dashed flex items-center justify-center bg-muted/40">
                        {chapter.isGeneratingImage ? (
                            <div className="flex flex-col items-center text-muted-foreground">
                                <Spinner className="h-6 w-6"/>
                                <p className="mt-2 text-xs">Illustrating...</p>
                            </div>
                        ) : chapter.imageUrl ? (
                            <img src={chapter.imageUrl} alt={`Illustration for ${chapter.title}`} className="object-cover w-full h-full rounded-lg" />
                        ) : (
                            <div className="text-center text-muted-foreground">
                                <p className="text-xs">No image yet</p>
                            </div>
                        )}
                    </div>
                    <Button onClick={handleGenerateImage} disabled={chapter.isGeneratingImage} size="sm" className="w-full">
                        {chapter.isGeneratingImage ? <><Spinner className="mr-2 h-3 w-3" /> Generating...</> : "Generate Illustration"}
                    </Button>
                </div>
            </div>
        </div>
    );
};


const EditorView: React.FC = () => {
    const { state } = useStory();
    const { transitionToStep, isTransitioning } = useStepTransition();
    const [activeChapterId, setActiveChapterId] = useState<string | null>(state.story?.chapters[0]?.id || null);

    if (!state.story) {
        return <p>Loading story...</p>;
    }

    const activeChapter = state.story.chapters.find(ch => ch.id === activeChapterId);

    const goToPreview = () => {
        transitionToStep(AppStep.PREVIEW);
    };

    return (
        <div className="flex flex-col space-y-4">
            {/* Mobile-first header with story title and preview button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-card/50 rounded-lg border border-border/20">
                <h2 className="text-xl font-bold">{state.story.title}</h2>
                <Button onClick={goToPreview} size="sm" className="w-full sm:w-auto" disabled={isTransitioning}>
                    {isTransitioning ? (
                        <>
                            <Spinner className="mr-2 h-3 w-3" /> Saving...
                        </>
                    ) : (
                        'Go to Preview'
                    )}
                </Button>
            </div>

            {/* Mobile-friendly chapter tabs */}
            <div className="flex overflow-x-auto gap-2 p-1 bg-card/50 rounded-lg border border-border/20">
                {state.story.chapters.map(chapter => (
                    <button
                        key={chapter.id}
                        onClick={() => setActiveChapterId(chapter.id)}
                        className={`flex-shrink-0 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                            activeChapterId === chapter.id
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-accent'
                        }`}
                    >
                        {chapter.title}
                    </button>
                ))}
            </div>

            {/* Mobile-optimized editor content */}
            <div className="bg-card/50 rounded-lg p-4 border border-border/20">
                {activeChapter ? (
                    <ChapterEditor chapter={activeChapter} />
                ) : (
                    <p>Select a chapter to begin editing.</p>
                )}
            </div>
        </div>
    );
};

export default EditorView;
