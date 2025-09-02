
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
        <div className="min-h-screen">
            {/* Fixed Header with better contrast */}
            <div className="sticky top-0 z-10 backdrop-blur-md bg-card/80 border-b border-border shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <h1 className="text-xl sm:text-2xl font-bold text-foreground">Book Preview</h1>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <Button variant="outline" onClick={handleBackToEdit} size="sm" className="w-full sm:w-auto" disabled={isTransitioning}>
                                {isTransitioning ? (
                                    <>
                                        <Spinner className="mr-2 h-3 w-3" /> Loading...
                                    </>
                                ) : (
                                    'Back to Editor'
                                )}
                            </Button>
                            <Button 
                                variant="outline" 
                                onClick={handleSaveStory}
                                disabled={isSaving}
                                size="sm"
                                className="w-full sm:w-auto"
                            >
                                {isSaving ? (
                                    <>
                                        <Spinner className="mr-2 h-3 w-3" /> Saving...
                                    </>
                                ) : (
                                    'Save Story'
                                )}
                            </Button>
                            <Button onClick={handleDownload} size="sm" className="w-full sm:w-auto">
                                Download PDF
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* E-book Style Content */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-card/95 backdrop-blur-sm rounded-2xl shadow-2xl overflow-hidden border border-border/50">
                    
                    {/* Cover Page */}
                    <div className="relative p-12 text-center bg-muted/50 min-h-[70vh] flex flex-col justify-center">
                        <div className="relative z-10">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-foreground mb-8 leading-tight">
                                {title}
                            </h1>
                            {chapters[0]?.imageUrl && (
                                <div className="mb-8 flex justify-center">
                                    <img 
                                        src={chapters[0].imageUrl} 
                                        alt="Cover" 
                                        className="w-80 h-80 object-cover rounded-2xl shadow-2xl border-4 border-white/50 dark:border-gray-700/50" 
                                    />
                                </div>
                            )}
                            <p className="text-lg text-muted-foreground font-serif italic">
                                An AI-Generated Story
                            </p>
                            <div className="mt-8 w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-400 dark:via-gray-500 to-transparent mx-auto"></div>
                        </div>
                    </div>

                    {/* Chapters */}
                    {chapters.map((chapter, index) => (
                        <div key={chapter.id} className="border-t border-gray-200/50 dark:border-gray-700/50">
                            <article className="p-8 sm:p-12 max-w-none">
                                {/* Chapter Header */}
                                <header className="mb-8 text-center">
                                    <div className="inline-block px-4 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full mb-4">
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Chapter {index + 1}</span>
                                    </div>
                                    <h2 className="text-3xl sm:text-4xl font-serif font-bold text-foreground leading-tight">
                                        {chapter.title}
                                    </h2>
                                    <div className="mt-4 w-16 h-0.5 bg-gradient-to-r from-transparent via-indigo-400 dark:via-indigo-500 to-transparent mx-auto"></div>
                                </header>

                                {/* Chapter Image - Much Larger */}
                                {chapter.imageUrl && (
                                    <figure className="mb-8 -mx-4 sm:-mx-8">
                                        <img 
                                            src={chapter.imageUrl} 
                                            alt={`Illustration for ${chapter.title}`} 
                                            className="w-full h-80 sm:h-96 object-cover rounded-xl shadow-lg" 
                                        />
                                    </figure>
                                )}

                                {/* Chapter Content with Book Typography */}
                                <div 
                                    className="prose prose-lg sm:prose-xl max-w-none
                                             prose-headings:font-serif prose-headings:text-gray-900 dark:prose-headings:text-white
                                             prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-p:leading-relaxed prose-p:mb-6
                                             prose-p:text-justify prose-p:indent-8 prose-p:font-serif prose-p:text-lg
                                             prose-strong:text-gray-900 dark:prose-strong:text-white prose-strong:font-bold
                                             prose-em:text-gray-700 dark:prose-em:text-gray-300 prose-em:italic
                                             prose-blockquote:border-l-4 prose-blockquote:border-indigo-300 dark:prose-blockquote:border-indigo-600
                                             prose-blockquote:bg-indigo-50/50 dark:prose-blockquote:bg-indigo-900/20 prose-blockquote:p-4 prose-blockquote:rounded-r-lg
                                             prose-blockquote:italic prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300"
                                    dangerouslySetInnerHTML={{ __html: chapter.content }}
                                />
                            </article>
                        </div>
                    ))}

                    {/* Book End */}
                    <div className="p-12 text-center bg-muted/50 border-t border-border/50">
                        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-gray-400 dark:via-gray-500 to-transparent mx-auto mb-6"></div>
                        <p className="text-lg font-serif italic text-muted-foreground">
                            ~ The End ~
                        </p>
                        <p className="text-sm text-muted-foreground mt-4 font-serif">
                            Created with StoryBook AI
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PreviewView;
