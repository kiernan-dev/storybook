import React, { useState, useEffect } from 'react';
import { getAllStories, loadStory, deleteStory, type StoredStory } from '../../services/database';
import { useStory } from '../../hooks/useStory';
import { AppStep } from '../../types';
import Button from './Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

interface SavedStoriesProps {
    onClose: () => void;
}

const SavedStories: React.FC<SavedStoriesProps> = ({ onClose }) => {
    const [stories, setStories] = useState<StoredStory[]>([]);
    const [loading, setLoading] = useState(true);
    const { dispatch } = useStory();

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
                onClose();
            }
        } catch (error) {
            console.error('Failed to load story:', error);
        }
    };

    const handleDeleteStory = async (storyId: number, title: string) => {
        if (confirm(`Are you sure you want to delete "${title}"?`)) {
            try {
                await deleteStory(storyId);
                await loadStories(); // Refresh the list
            } catch (error) {
                console.error('Failed to delete story:', error);
            }
        }
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">Saved Stories</h2>
                        <Button variant="outline" onClick={onClose}>Close</Button>
                    </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    {stories.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">No stories saved yet.</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Generate and complete a story to see it here!
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {stories.map((story) => (
                                <Card key={story.id} className="cursor-pointer hover:shadow-md transition-shadow">
                                    <CardHeader>
                                        <CardTitle className="text-lg">{story.title}</CardTitle>
                                        <CardDescription>
                                            Created: {story.createdAt.toLocaleDateString()}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex justify-between space-x-2">
                                            <Button 
                                                onClick={() => handleLoadStory(story.id!)}
                                                className="flex-1"
                                            >
                                                Load Story
                                            </Button>
                                            <Button 
                                                variant="destructive" 
                                                onClick={() => handleDeleteStory(story.id!, story.title)}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedStories;