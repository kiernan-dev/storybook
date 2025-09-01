
import React, { useState } from 'react';
import { useStory } from '../../hooks/useStory';
import { useStepTransition } from '../../hooks/useStepTransition';
import { AppStep } from '../../types';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';

const PreviewView: React.FC = () => {
    const { state, saveCurrentStory } = useStory();
    const { transitionToStep, isTransitioning } = useStepTransition();
    const [isSaving, setIsSaving] = useState(false);

    if (!state.story) {
        return (
            <div className="text-center">
                <p>No story to preview. Please generate a story first.</p>
                <Button onClick={() => transitionToStep(AppStep.PROMPT)} className="mt-4">
                    Back to Start
                </Button>
            </div>
        );
    }

    const { title, chapters } = state.story;

    const handleDownload = () => {
        alert("PDF generation is a complex feature. In a real application, this would trigger a KDP-compliant PDF download.");
    };
    
    const handleBackToEdit = () => {
        transitionToStep(AppStep.EDITING);
    };

    const handleSaveStory = async () => {
        setIsSaving(true);
        try {
            const storyId = await saveCurrentStory();
            if (storyId) {
                alert(`Story "${state.story?.title}" saved successfully!`);
            }
        } catch (error) {
            console.error('Failed to save story:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Mobile-friendly header */}
            <div className="flex flex-col space-y-4 p-4 bg-card/50 rounded-lg border border-border/20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-xl sm:text-2xl font-bold">Book Preview</h1>
                    <Button variant="outline" onClick={handleBackToEdit} size="sm" className="w-full sm:w-auto" disabled={isTransitioning}>
                        {isTransitioning ? (
                            <>
                                <Spinner className="mr-2 h-3 w-3" /> Loading...
                            </>
                        ) : (
                            'Back to Editor'
                        )}
                    </Button>
                </div>
                
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                        variant="outline" 
                        onClick={handleSaveStory}
                        disabled={isSaving}
                        size="sm"
                        className="w-full sm:flex-1"
                    >
                        {isSaving ? (
                            <>
                                <Spinner className="mr-2 h-3 w-3" /> Saving...
                            </>
                        ) : (
                            'Save Story'
                        )}
                    </Button>
                    <Button onClick={handleDownload} size="sm" className="w-full sm:flex-1">
                        Download PDF
                    </Button>
                </div>
            </div>

            {/* Mobile-responsive preview content */}
            <div className="bg-card/50 rounded-lg border border-border/20 overflow-hidden">
                {/* Cover Page - Mobile optimized */}
                <div className="p-6 sm:p-8 flex flex-col items-center text-center bg-muted/20 min-h-[50vh] sm:min-h-[60vh] justify-center space-y-4">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold">{title}</h1>
                    {chapters[0]?.imageUrl && (
                        <img src={chapters[0].imageUrl} alt="Cover" className="w-full max-w-xs h-40 sm:h-48 object-cover rounded-lg shadow-md" />
                    )}
                    <p className="text-sm sm:text-base text-muted-foreground">By An AI Author</p>
                </div>

                {/* Chapters - Scrollable on mobile */}
                <div className="divide-y divide-border/20">
                    {chapters.map((chapter, index) => (
                        <div key={chapter.id} className="p-4 sm:p-6 space-y-4">
                            <h2 className="text-lg sm:text-xl font-serif font-bold">{chapter.title}</h2>
                            <div className="space-y-3">
                                {chapter.imageUrl && (
                                    <div className="w-full sm:w-48 sm:float-left sm:mr-4 sm:mb-2">
                                        <img src={chapter.imageUrl} alt={`Illustration for ${chapter.title}`} className="w-full h-32 sm:h-36 object-cover rounded-lg shadow-sm" />
                                    </div>
                                )}
                                <div className="text-sm sm:text-base leading-relaxed font-serif">
                                    <p className="whitespace-pre-wrap">{chapter.content}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PreviewView;
