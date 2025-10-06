import React, { useState, useEffect } from 'react';
import { getAllStories, loadStory, deleteStory, clearAllStories, StoredStory } from '../../services/database';
import { useStory } from '../../hooks/useStory';
import { AppStep } from '../../types';
import Button from './Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';
import ConfirmationModal from './ConfirmationModal';
import { useToast } from './Toast';

interface SavedStoriesProps {
    onClose: () => void;
}

type StoredStoryWithCover = StoredStory & { coverImage?: string };

const SavedStories: React.FC<SavedStoriesProps> = ({ onClose }) => {
    const [stories, setStories] = useState<StoredStoryWithCover[]>([]);
    const [loading, setLoading] = useState(true);
    const [confirmAction, setConfirmAction] = useState<{
        type: 'delete' | 'clearAll';
        storyId?: number;
        storyTitle?: string;
    } | null>(null);
    const { dispatch } = useStory();
    const { addToast } = useToast();

    useEffect(() => {
        loadStories();
    }, []);

    const loadStories = async () => {
        try {
            const savedStories = await getAllStories();
            setStories(savedStories);
        } catch (error) {
            console.error('Failed to load stories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadStory = async (storyId: number) => {
        try {
            const story = await loadStory(storyId);
            if (story) {
                dispatch({ type: 'SET_STORY', payload: story });
                dispatch({ type: 'SET_STEP', payload: AppStep.PREVIEW });
                addToast({
                    type: 'success',
                    title: 'Story loaded',
                    description: `"${story.title}" has been loaded successfully`,
                    duration: 3000
                });
                onClose();
            }
        } catch (error) {
            console.error('Failed to load story:', error);
            addToast({
                type: 'error',
                title: 'Load failed',
                description: 'Unable to load the story. Please try again.',
                duration: 5000
            });
        }
    };

    const handleDeleteStory = (storyId: number, title: string) => {
        setConfirmAction({
            type: 'delete',
            storyId,
            storyTitle: title
        });
    };

    const handleClearAllStories = () => {
        setConfirmAction({
            type: 'clearAll'
        });
    };

    const executeAction = async () => {
        if (!confirmAction) return;

        try {
            if (confirmAction.type === 'delete' && confirmAction.storyId) {
                await deleteStory(confirmAction.storyId);
            } else if (confirmAction.type === 'clearAll') {
                await clearAllStories();
            }
            await loadStories(); // Refresh the list
        } catch (error) {
            console.error(`Failed to ${confirmAction.type}:`, error);
        } finally {
            setConfirmAction(null);
        }
    };

    const cancelAction = () => {
        setConfirmAction(null);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-background p-6 rounded-lg">
                    <p>Loading stories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-background/80 border border-white/10 dark:border-black/10 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Saved Stories</h2>
                        <div className="flex space-x-2">
                            {stories.length > 0 && (
                                <Button 
                                    variant="destructive" 
                                    size="sm"
                                    onClick={handleClearAllStories}
                                >
                                    Clear All
                                </Button>
                            )}
                            <Button variant="outline" onClick={onClose}>Close</Button>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 overflow-y-auto flex-grow">
                    {stories.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No stories saved yet.</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Generate and complete a story to see it here!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {stories.map((story) => (
                                <Card key={story.id} className="flex flex-col">
                                    <CardHeader>
                                        <CardTitle className="text-lg truncate">{story.title}</CardTitle>
                                        <CardDescription>
                                            Saved: {story.createdAt.toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-grow">
                                        <div className="aspect-video bg-muted rounded-md mb-4 overflow-hidden">
                                            {story.coverImage ? (
                                                <img src={story.coverImage} alt={story.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1 text-sm">
                                            <p><span className="font-semibold">Genre:</span> {story.genre}</p>
                                            <p><span className="font-semibold">Audience:</span> {story.audience}</p>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <div className="flex w-full justify-between space-x-2">
                                            <Button 
                                                onClick={() => handleLoadStory(story.id!)}
                                                className="flex-1"
                                            >
                                                Load
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                size="sm"
                                                onClick={() => handleDeleteStory(story.id!, story.title)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!confirmAction}
                title={confirmAction?.type === 'clearAll' ? 'Clear All Stories' : 'Delete Story'}
                message={
                    confirmAction?.type === 'clearAll'
                        ? 'Are you sure you want to delete ALL saved stories? This action cannot be undone.'
                        : `Are you sure you want to delete "${confirmAction?.storyTitle}"? This action cannot be undone.`
                }
                confirmText={confirmAction?.type === 'clearAll' ? 'Clear All' : 'Delete'}
                cancelText="Cancel"
                onConfirm={executeAction}
                onCancel={cancelAction}
                variant="destructive"
            />
        </div>
    );
};

export default SavedStories;