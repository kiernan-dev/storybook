import Dexie, { Table } from 'dexie';
import { Story, Chapter, Genre, Audience } from '../types';

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

export interface StoryPrompt {
    id?: number;
    prompt: string;
    genre: Genre | 'any';
    audience: Audience | 'any';
    tags: string[];
}

export class StoryBookDB extends Dexie {
    stories!: Table<StoredStory>;
    chapters!: Table<StoredChapter>;
    storyPrompts!: Table<StoryPrompt>;

    constructor() {
        super('StoryBookDB');
        this.version(1).stores({
            stories: '++id, title, createdAt, updatedAt',
            chapters: '++id, storyId, title, imageBlob',
            storyPrompts: '++id, genre, audience, *tags'
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

// Get random story prompt based on genre and audience
export const getRandomPrompt = async (genre?: Genre, audience?: Audience): Promise<string> => {
    try {
        let query = db.storyPrompts.toCollection();

        // Filter by genre if specified
        if (genre) {
            query = query.filter(prompt => prompt.genre === genre || prompt.genre === 'any');
        }

        // Filter by audience if specified  
        if (audience) {
            query = query.filter(prompt => prompt.audience === audience || prompt.audience === 'any');
        }

        const matchingPrompts = await query.toArray();
        
        if (matchingPrompts.length === 0) {
            // Fallback to any prompts if no matches
            const allPrompts = await db.storyPrompts.toArray();
            if (allPrompts.length === 0) {
                await seedStoryPrompts(); // Initialize if empty
                return getRandomPrompt(genre, audience); // Retry
            }
            const randomIndex = Math.floor(Math.random() * allPrompts.length);
            return allPrompts[randomIndex].prompt;
        }

        const randomIndex = Math.floor(Math.random() * matchingPrompts.length);
        return matchingPrompts[randomIndex].prompt;
    } catch (error) {
        console.error('Failed to get random prompt:', error);
        return "A mysterious adventure waiting to unfold...";
    }
};

// Seed database with story prompts
export const seedStoryPrompts = async (): Promise<void> => {
    try {
        const existingCount = await db.storyPrompts.count();
        if (existingCount > 0) return; // Already seeded

        const prompts: Omit<StoryPrompt, 'id'>[] = [
            // Fantasy - Children
            { prompt: "A young dragon who's afraid of flying discovers a magical potion that gives confidence", genre: Genre.FANTASY, audience: Audience.CHILDREN, tags: ['dragon', 'confidence', 'magic'] },
            { prompt: "A talking tree helps forest animals solve their problems with ancient wisdom", genre: Genre.FANTASY, audience: Audience.CHILDREN, tags: ['tree', 'forest', 'wisdom'] },
            { prompt: "A little girl finds a door in her garden that leads to a kingdom of friendly fairies", genre: Genre.FANTASY, audience: Audience.CHILDREN, tags: ['fairies', 'garden', 'kingdom'] },
            { prompt: "A magical paintbrush brings drawings to life, but only for those with pure hearts", genre: Genre.FANTASY, audience: Audience.CHILDREN, tags: ['paintbrush', 'magic', 'drawings'] },
            { prompt: "A unicorn loses its horn and must learn that true magic comes from kindness", genre: Genre.FANTASY, audience: Audience.CHILDREN, tags: ['unicorn', 'kindness', 'magic'] },

            // Fantasy - Pre-teen  
            { prompt: "A 12-year-old discovers they're the last wizard in a world where magic is forbidden", genre: Genre.FANTASY, audience: Audience.PRE_TEEN, tags: ['wizard', 'forbidden', 'adventure'] },
            { prompt: "Twin siblings inherit opposing magical powers and must work together to save their realm", genre: Genre.FANTASY, audience: Audience.PRE_TEEN, tags: ['twins', 'powers', 'teamwork'] },
            { prompt: "A young knight's quest to prove themselves leads to befriending their supposed enemy", genre: Genre.FANTASY, audience: Audience.PRE_TEEN, tags: ['knight', 'quest', 'friendship'] },
            { prompt: "A magical academy student struggles with spells until they discover their unique gift", genre: Genre.FANTASY, audience: Audience.PRE_TEEN, tags: ['academy', 'spells', 'unique'] },

            // Sci-Fi - Children
            { prompt: "A friendly robot crash-lands in a backyard and needs help fixing their spaceship", genre: Genre.SCI_FI, audience: Audience.CHILDREN, tags: ['robot', 'spaceship', 'friendship'] },
            { prompt: "A time machine in the basement takes kids on educational adventures through history", genre: Genre.SCI_FI, audience: Audience.CHILDREN, tags: ['time travel', 'history', 'learning'] },
            { prompt: "An alien child gets lost on Earth and must learn human customs to find their way home", genre: Genre.SCI_FI, audience: Audience.CHILDREN, tags: ['alien', 'earth', 'customs'] },
            { prompt: "A young inventor creates a device that can talk to animals from other planets", genre: Genre.SCI_FI, audience: Audience.CHILDREN, tags: ['inventor', 'animals', 'planets'] },

            // Adventure - Children  
            { prompt: "A treasure map found in an old book leads to the adventure of a lifetime", genre: Genre.ADVENTURE, audience: Audience.CHILDREN, tags: ['treasure', 'map', 'adventure'] },
            { prompt: "A group of friends builds a treehouse that becomes their base for neighborhood mysteries", genre: Genre.ADVENTURE, audience: Audience.CHILDREN, tags: ['treehouse', 'friends', 'mysteries'] },
            { prompt: "A lost puppy leads children through a magical forest full of helpful creatures", genre: Genre.ADVENTURE, audience: Audience.CHILDREN, tags: ['puppy', 'forest', 'creatures'] },
            { prompt: "Kids discover a secret passage in their school that leads to an underground world", genre: Genre.ADVENTURE, audience: Audience.CHILDREN, tags: ['school', 'secret', 'underground'] },

            // Mystery - Pre-teen
            { prompt: "Strange things happen at the new school, and only one student notices the pattern", genre: Genre.MYSTERY, audience: Audience.PRE_TEEN, tags: ['school', 'strange', 'pattern'] },
            { prompt: "A young detective must solve the case of the missing neighborhood cats", genre: Genre.MYSTERY, audience: Audience.PRE_TEEN, tags: ['detective', 'missing', 'cats'] },
            { prompt: "Old letters found in the attic reveal a family secret that changes everything", genre: Genre.MYSTERY, audience: Audience.PRE_TEEN, tags: ['letters', 'attic', 'secret'] },

            // Children's Book - Generic
            { prompt: "A shy child learns to make friends by helping others with their talents", genre: Genre.CHILDREN, audience: Audience.CHILDREN, tags: ['shy', 'friends', 'helping'] },
            { prompt: "A little bear who doesn't want to hibernate discovers the magic of winter", genre: Genre.CHILDREN, audience: Audience.CHILDREN, tags: ['bear', 'hibernate', 'winter'] },
            { prompt: "A child who moves to a new town finds courage by joining the local community garden", genre: Genre.CHILDREN, audience: Audience.CHILDREN, tags: ['moving', 'courage', 'garden'] },

            // Teen Adventures
            { prompt: "Teenagers discover their town sits on a portal to other dimensions", genre: Genre.ADVENTURE, audience: Audience.TEEN, tags: ['portal', 'dimensions', 'discovery'] },
            { prompt: "A high school band's music has the power to heal emotional wounds", genre: Genre.ADVENTURE, audience: Audience.TEEN, tags: ['band', 'music', 'healing'] },

            // Adult Fantasy  
            { prompt: "A retired warrior must take up their sword one last time to protect a new generation", genre: Genre.FANTASY, audience: Audience.ADULT, tags: ['retired warrior', 'sword', 'protection'] },
            { prompt: "Magic returns to the modern world, but corporations want to control it", genre: Genre.FANTASY, audience: Audience.ADULT, tags: ['modern magic', 'corporations', 'control'] },

            // Cross-genre prompts
            { prompt: "An unlikely friendship between two very different characters changes both their lives", genre: 'any' as Genre, audience: 'any' as Audience, tags: ['friendship', 'different', 'change'] },
            { prompt: "A character must overcome their greatest fear to save what they love most", genre: 'any' as Genre, audience: 'any' as Audience, tags: ['fear', 'courage', 'love'] },
            { prompt: "A journey to find something lost leads to discovering something unexpected", genre: 'any' as Genre, audience: 'any' as Audience, tags: ['journey', 'lost', 'discovery'] },
            { prompt: "A character with a special ability must decide whether to hide it or use it to help others", genre: 'any' as Genre, audience: 'any' as Audience, tags: ['ability', 'choice', 'help'] },
        ];

        await db.storyPrompts.bulkAdd(prompts);
        console.log(`Seeded ${prompts.length} story prompts`);
    } catch (error) {
        console.error('Failed to seed story prompts:', error);
    }
};