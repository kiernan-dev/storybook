
import React, { useState, useRef } from 'react';
import { useStory } from '../../hooks/useStory';
import { useStepTransition } from '../../hooks/useStepTransition';
import { Chapter, AppStep } from '../../types';
import Button from '../ui/Button';
import RichTextEditor from '../ui/RichTextEditor';
import { generateImageForChapter } from '../../services/aiService';
import { isDemoMode } from '../../services/mockData';
import Spinner from '../ui/Spinner';

const ChapterEditor: React.FC<{ chapter: Chapter; onImageClick: (imageUrl: string, title: string) => void }> = ({ chapter, onImageClick }) => {
    const { state, dispatch, saveCurrentStory } = useStory();
    const originalContentRef = useRef(chapter.content);
    const [customImagePrompt, setCustomImagePrompt] = useState('');

    const handleContentChange = (content: string) => {
        dispatch({
            type: 'UPDATE_CHAPTER',
            payload: { chapterId: chapter.id, content },
        });
    };

    const handleTextBlur = async () => {
        // Auto-save only if content has changed
        if (chapter.content !== originalContentRef.current) {
            try {
                await saveCurrentStory(state.story);
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
            const imageUrl = await generateImageForChapter(chapter.content, customImagePrompt);
            dispatch({ type: 'SET_IMAGE_URL', payload: { chapterId: chapter.id, url: imageUrl } });
            
            // Create an updated story object to pass to the save function
            const updatedStory = {
                ...state.story!,
                chapters: state.story!.chapters.map(ch => 
                    ch.id === chapter.id ? { ...ch, imageUrl } : ch
                )
            };

            // Auto-save with the updated story object
            try {
                await saveCurrentStory(updatedStory);
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

    const handleManualSave = async () => {
        try {
            await saveCurrentStory(state.story);
            console.log('Manual save completed');
        } catch (error) {
            console.error('Manual save failed:', error);
        }
    };

    const handleCopyText = () => {
        navigator.clipboard.writeText(chapter.content).then(() => {
            console.log('Chapter content copied to clipboard');
        }).catch(err => {
            console.error('Failed to copy text:', err);
        });
    };


    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">{chapter.title}</h3>
                <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={handleCopyText}>
                        Copy Text
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleManualSave}>
                        Save
                    </Button>
                </div>
            </div>
            
            {/* Mobile-optimized layout */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4">
                {/* Content editor */}
                <div className="order-2 lg:order-1 w-full overflow-hidden">
                    <RichTextEditor
                        value={chapter.content}
                        onChange={handleContentChange}
                        onBlur={handleTextBlur}
                        className="w-full"
                        placeholder="Edit your chapter content..."
                    />
                </div>
                
                {/* Image area - larger and more square for 1024x1024 images */}
                <div className="order-1 lg:order-2 flex flex-col space-y-3">
                    <div className="w-full h-48 sm:h-56 lg:h-72 aspect-square rounded-lg border border-dashed flex items-center justify-center bg-muted/40">
                        {chapter.isGeneratingImage ? (
                            <div className="flex flex-col items-center text-muted-foreground">
                                <Spinner className="h-6 w-6"/>
                                <p className="mt-2 text-xs">Illustrating...</p>
                            </div>
                        ) : chapter.imageUrl ? (
                            <img 
                                src={chapter.imageUrl} 
                                alt={`Illustration for ${chapter.title}`} 
                                className="object-cover w-full h-full rounded-lg cursor-pointer hover:opacity-90 transition-opacity" 
                                onClick={() => onImageClick(chapter.imageUrl!, chapter.title)}
                                title="Click to view full size"
                            />
                        ) : (
                            <div className="text-center text-muted-foreground">
                                <p className="text-xs">No image yet</p>
                            </div>
                        )}
                    </div>
                    <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                            💡 Leave blank to automatically generate an image prompt from your chapter content
                        </p>
                        <textarea
                            value={customImagePrompt}
                            onChange={(e) => setCustomImagePrompt(e.target.value)}
                            placeholder='Describe the scene you want illustrated... (e.g., "a cozy library at sunset" or "children playing in a magical forest")'
                            rows={4}
                            className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                        />
                        <Button onClick={handleGenerateImage} disabled={chapter.isGeneratingImage} size="sm" className="w-full">
                            {chapter.isGeneratingImage ? (
                                <><Spinner className="mr-2 h-3 w-3" /> {isDemoMode() ? 'Loading Demo...' : 'Generating...'}</>
                            ) : (
                                isDemoMode() ? "Load Demo Image" : "Generate Illustration"
                            )}
                        </Button>
                        {isDemoMode() && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                                ⚠️ Demo mode: Sample image will be loaded
                            </p>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
};


const EditorView: React.FC = () => {
    const { state } = useStory();
    const { transitionToStep, isTransitioning } = useStepTransition();
    const [activeChapterId, setActiveChapterId] = useState<string | null>(state.story?.chapters[0]?.id || null);
    const [overlayImage, setOverlayImage] = useState<{ url: string; title: string } | null>(null);

    const handleImageClick = (imageUrl: string, title: string) => {
        setOverlayImage({ url: imageUrl, title });
    };

    const closeOverlay = () => {
        setOverlayImage(null);
    };

    if (!state.story) {
        return <p>Loading story...</p>;
    }

    const activeChapter = state.story.chapters.find(ch => ch.id === activeChapterId);

    const goToPreview = () => {
        transitionToStep(AppStep.PREVIEW);
    };

    return (
        <>
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
            <div className="bg-card/50 rounded-lg p-4 border border-border/20 w-full overflow-hidden">
                {activeChapter ? (
                    <ChapterEditor key={activeChapter.id} chapter={activeChapter} onImageClick={handleImageClick} />
                ) : (
                    <p>Select a chapter to begin editing.</p>
                )}
            </div>
        </div>

        {/* Image Overlay - Separate from page content */}
        {overlayImage && (
            <div 
                className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col"
                onClick={closeOverlay}
            >
                {/* Header */}
                <div className="flex justify-between items-center px-4 py-4 flex-shrink-0">
                    <h3 className="text-white text-lg font-medium truncate">
                        {overlayImage.title}
                    </h3>
                    <button
                        onClick={closeOverlay}
                        className="text-white/70 hover:text-white transition-colors p-2 rounded-full hover:bg-white/10"
                        title="Close (ESC)"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Image */}
                <div className="flex-1 flex items-center justify-center px-4 min-h-0">
                    <div className="w-full h-full max-w-4xl flex items-center justify-center">
                        <img 
                            src={overlayImage.url} 
                            alt={`Full size illustration for ${overlayImage.title}`}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-center gap-3 px-4 py-6 bg-gradient-to-t from-black/50 to-transparent flex-shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const link = document.createElement('a');
                            link.href = overlayImage.url;
                            link.download = `${overlayImage.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_illustration.png`;
                            link.click();
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                    </button>
                    <button
                        onClick={async (e) => {
                            e.stopPropagation();
                            try {
                                const response = await fetch(overlayImage.url);
                                const blob = await response.blob();
                                const dataUrl = await new Promise<string>((resolve) => {
                                    const reader = new FileReader();
                                    reader.onload = () => resolve(reader.result as string);
                                    reader.readAsDataURL(blob);
                                });
                                
                                const newWindow = window.open();
                                if (newWindow) {
                                    newWindow.document.write(`
                                        <!DOCTYPE html>
                                        <html>
                                        <head>
                                            <title>${overlayImage.title}</title>
                                            <style>
                                                body { margin: 0; padding: 20px; background: #000; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
                                                img { max-width: 100%; max-height: 100vh; object-fit: contain; border-radius: 8px; }
                                            </style>
                                        </head>
                                        <body>
                                            <img src="${dataUrl}" alt="${overlayImage.title}" />
                                        </body>
                                        </html>
                                    `);
                                    newWindow.document.close();
                                }
                            } catch (error) {
                                console.error('Failed to open image in new tab:', error);
                            }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Open in New Tab
                    </button>
                </div>
            </div>
        )}
        </>
    );
};

export default EditorView;
