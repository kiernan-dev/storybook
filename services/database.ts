import Dexie, { Table } from 'dexie';
import { Story, Chapter } from '../types';

export interface StoredStory extends Omit<Story, 'chapters'> {
    id?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface StoredChapter extends Omit<Chapter, 'imageUrl'> {
    id?: number;
    storyId: number;
    imageBlob?: Blob;
}

export class StoryBookDB extends Dexie {
    stories!: Table<StoredStory>;
    chapters!: Table<StoredChapter>;

    constructor() {
        super('StoryBookDB');
        this.version(1).stores({
            stories: '++id, title, createdAt, updatedAt',
            chapters: '++id, storyId, title, imageBlob'
        });
    }
}

export const db = new StoryBookDB();

// Convert base64 data URL to Blob
export const dataURLToBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

// Convert Blob to base64 data URL
export const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
    });
};

// Save story to database
export const saveStory = async (story: Story): Promise<number> => {
    try {
        const now = new Date();
        
        // Save story metadata
        const storyId = await db.stories.add({
            title: story.title,
            createdAt: now,
            updatedAt: now
        });

        // Save chapters with images as blobs
        for (const chapter of story.chapters) {
            const storedChapter: StoredChapter = {
                storyId,
                title: chapter.title,
                content: chapter.content,
                imagePrompt: chapter.imagePrompt,
                isGeneratingImage: false
            };

            // Convert image data URL to blob if exists
            if (chapter.imageUrl && chapter.imageUrl.startsWith('data:')) {
                storedChapter.imageBlob = dataURLToBlob(chapter.imageUrl);
            }

            await db.chapters.add(storedChapter);
        }

        console.log(`Story "${story.title}" saved with ID: ${storyId}`);
        return storyId;
    } catch (error) {
        console.error('Failed to save story:', error);
        throw error;
    }
};

// Load story from database
export const loadStory = async (storyId: number): Promise<Story | null> => {
    try {
        const storedStory = await db.stories.get(storyId);
        if (!storedStory) return null;

        const storedChapters = await db.chapters.where('storyId').equals(storyId).toArray();
        
        const chapters: Chapter[] = [];
        for (const storedChapter of storedChapters) {
            const chapter: Chapter = {
                id: storedChapter.id?.toString() || '',
                title: storedChapter.title,
                content: storedChapter.content,
                imagePrompt: storedChapter.imagePrompt,
                imageUrl: null,
                isGeneratingImage: false
            };

            // Convert blob back to data URL if exists
            if (storedChapter.imageBlob) {
                chapter.imageUrl = await blobToDataURL(storedChapter.imageBlob);
            }

            chapters.push(chapter);
        }

        return {
            title: storedStory.title,
            chapters
        };
    } catch (error) {
        console.error('Failed to load story:', error);
        return null;
    }
};

// Get all stories
export const getAllStories = async (): Promise<StoredStory[]> => {
    try {
        return await db.stories.orderBy('updatedAt').reverse().toArray();
    } catch (error) {
        console.error('Failed to get stories:', error);
        return [];
    }
};

// Delete story
export const deleteStory = async (storyId: number): Promise<void> => {
    try {
        await db.transaction('rw', [db.stories, db.chapters], async () => {
            await db.chapters.where('storyId').equals(storyId).delete();
            await db.stories.delete(storyId);
        });
        console.log(`Story with ID ${storyId} deleted`);
    } catch (error) {
        console.error('Failed to delete story:', error);
        throw error;
    }
};