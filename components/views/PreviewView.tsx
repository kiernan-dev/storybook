
import React from 'react';
import { useStory } from '../../hooks/useStory';
import { AppStep } from '../../types';
import Button from '../ui/Button';

const PreviewView: React.FC = () => {
    const { state, dispatch } = useStory();

    if (!state.story) {
        return (
            <div className="text-center">
                <p>No story to preview. Please generate a story first.</p>
                <Button onClick={() => dispatch({ type: 'SET_STEP', payload: AppStep.PROMPT })} className="mt-4">
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
        dispatch({ type: 'SET_STEP', payload: AppStep.EDITING });
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Book Preview</h1>
                <div className="space-x-2">
                     <Button variant="outline" onClick={handleBackToEdit}>Back to Editor</Button>
                    <Button onClick={handleDownload}>Download KDP-Ready PDF</Button>
                </div>
            </div>

            <div className="p-8 bg-white dark:bg-gray-800 shadow-lg rounded-lg space-y-12">
                {/* Cover Page */}
                <div className="h-[11in] w-[8.5in] mx-auto p-8 border flex flex-col justify-center items-center text-center bg-gray-100 dark:bg-gray-700">
                    <h1 className="text-5xl font-serif font-bold text-gray-800 dark:text-gray-100">{title}</h1>
                    {chapters[0]?.imageUrl && (
                        <img src={chapters[0].imageUrl} alt="Cover" className="mt-8 w-3/4 max-h-96 object-cover rounded-lg shadow-md" />
                    )}
                    <p className="mt-auto text-lg text-gray-600 dark:text-gray-300">By An AI Author</p>
                </div>

                {/* Title Page */}
                <div className="h-[11in] w-[8.5in] mx-auto p-12 border flex flex-col justify-center text-center">
                    <h1 className="text-4xl font-serif font-bold text-gray-800 dark:text-gray-100">{title}</h1>
                    <p className="mt-4 text-xl text-gray-600 dark:text-gray-300">By An AI Author</p>
                </div>

                {/* Chapters */}
                {chapters.map((chapter, index) => (
                    <div key={chapter.id} className="h-[11in] w-[8.5in] mx-auto p-12 border break-after-page">
                        <h2 className="text-3xl font-serif font-bold mb-6 text-gray-800 dark:text-gray-100">{chapter.title}</h2>
                        <div className="space-y-4 text-lg text-gray-700 dark:text-gray-200 leading-relaxed font-serif">
                            {chapter.imageUrl && (
                                <div className="float-left mr-6 mb-4 w-1/2">
                                    <img src={chapter.imageUrl} alt={`Illustration for ${chapter.title}`} className="w-full object-cover rounded-lg shadow-md" />
                                </div>
                            )}
                            <p className="whitespace-pre-wrap">{chapter.content}</p>
                        </div>
                        <div className="absolute bottom-6 right-12 text-gray-500">{index + 3}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PreviewView;
