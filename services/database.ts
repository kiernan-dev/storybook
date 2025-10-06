import Dexie, { Table } from 'dexie';
import { Story, Chapter, Genre, Audience } from '../types';

export interface StoredStory extends Omit<Story, 'chapters'> {
    id?: number;
    createdAt: Date;
    updatedAt: Date;
    genre: Genre;
    audience: Audience;
}

export interface StoredChapter extends Omit<Chapter, 'id' | 'imageUrl'> {
    id?: number; // This is the auto-incrementing primary key from Dexie
    uiId: string; // This is the string-based ID used in the UI state
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
        this.version(3).stores({ // Bump the version to handle schema change
            stories: '++id, title, createdAt, updatedAt, genre, audience',
            chapters: '++id, uiId, storyId', // Index uiId and storyId
            storyPrompts: '++id, genre, audience, *tags'
        }).upgrade(tx => {
            // Optional: migration logic if needed, for now just letting it rebuild
            console.log("Upgrading database schema to version 2");
        });
    }
}

export const db = new StoryBookDB();

// Convert base64 data URL to Blob
export const dataURLToBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL format');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
};

// Convert URL or data URL to Blob
export const urlToBlob = async (url: any): Promise<Blob> => {
    // Handle non-string inputs
    if (!url || typeof url !== 'string') {
        console.error('urlToBlob received non-string input:', url);
        throw new Error('Invalid URL format - expected string but received: ' + typeof url);
    }
    
    // If it's a data URL, use the existing function
    if (url.startsWith('data:')) {
        return dataURLToBlob(url);
    }
    
    // If it's a regular URL, fetch it
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        return await response.blob();
    } catch (error) {
        console.warn('Failed to fetch image for storage, saving URL instead:', error);
        // Return a text blob with the URL as fallback
        return new Blob([url], { type: 'text/plain' });
    }
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
        let storyId: number;

        if (story.id) {
            // Update existing story
            storyId = story.id;
            await db.stories.update(storyId, {
                title: story.title,
                genre: story.genre,
                audience: story.audience,
                updatedAt: now
            });

            // Delete existing chapters for this story to re-add them
            await db.chapters.where('storyId').equals(storyId).delete();
        } else {
            // Create new story
            storyId = await db.stories.add({
                title: story.title,
                genre: story.genre,
                audience: story.audience,
                createdAt: now,
                updatedAt: now
            });
        }

        // Save chapters with images as blobs
        for (const chapter of story.chapters) {
            const storedChapter: Omit<StoredChapter, 'id'> = {
                uiId: chapter.id,
                storyId,
                title: chapter.title,
                content: chapter.content,
                imagePrompt: chapter.imagePrompt,
                isGeneratingImage: chapter.isGeneratingImage,
                imageBlob: chapter.imageUrl ? await urlToBlob(chapter.imageUrl) : undefined,
            };
            await db.chapters.add(storedChapter);
        }

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
                id: storedChapter.uiId, // Restore the original UI ID
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
            id: storyId,
            title: storedStory.title,
            genre: storedStory.genre,
            audience: storedStory.audience,
            chapters
        };
    } catch (error) {
        console.error('Failed to load story:', error);
        return null;
    }
};

// Get all stories
export const getAllStories = async (): Promise<(StoredStory & { coverImage?: string })[]> => {
    try {
        const stories = await db.stories.orderBy('updatedAt').reverse().toArray();
        const storiesWithCovers = await Promise.all(
            stories.map(async (story) => {
                if (!story.id) return story;
                const firstChapter = await db.chapters.where('storyId').equals(story.id).first();
                if (firstChapter?.imageBlob) {
                    const coverImage = await blobToDataURL(firstChapter.imageBlob);
                    return { ...story, coverImage };
                }
                return story;
            })
        );
        return storiesWithCovers;
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
export const getRandomPrompt = async (genre?: Genre, audience?: Audience, excludePromptId?: number): Promise<{ prompt: string; id: number } | string> => {
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

        let matchingPrompts = await query.toArray();
        
        // Filter out the excluded prompt if specified
        if (excludePromptId !== undefined) {
            matchingPrompts = matchingPrompts.filter(prompt => prompt.id !== excludePromptId);
        }
        
        if (matchingPrompts.length === 0) {
            // Fallback to any prompts if no matches
            const allPrompts = await db.storyPrompts.toArray();
            if (allPrompts.length === 0) {
                await seedStoryPrompts(); // Initialize if empty
                return getRandomPrompt(genre, audience, excludePromptId); // Retry
            }
            const randomIndex = Math.floor(Math.random() * allPrompts.length);
            const selectedPrompt = allPrompts[randomIndex];
            return { prompt: selectedPrompt.prompt, id: selectedPrompt.id };
        }

        const randomIndex = Math.floor(Math.random() * matchingPrompts.length);
        const selectedPrompt = matchingPrompts[randomIndex];
        return { prompt: selectedPrompt.prompt, id: selectedPrompt.id };
    } catch (error) {
        console.error('Failed to get random prompt:', error);
        return "A mysterious adventure waiting to unfold...";
    }
};

// Clear all saved stories from database
export const clearAllStories = async (): Promise<void> => {
    try {
        await db.transaction('rw', [db.stories, db.chapters], async () => {
            await db.chapters.clear();
            await db.stories.clear();
        });
        console.log('All saved stories cleared from database');
    } catch (error) {
        console.error('Failed to clear stories:', error);
        throw error;
    }
};

// Force reseed database with new story prompts
export const forceReseedStoryPrompts = async (): Promise<void> => {
    try {
        // Clear existing prompts
        await db.storyPrompts.clear();
        console.log('Cleared existing prompts');
        
        // Re-seed with new prompts
        await seedStoryPrompts();
    } catch (error) {
        console.error('Failed to force reseed story prompts:', error);
    }
};

// Seed database with story prompts
export const seedStoryPrompts = async (): Promise<void> => {
    try {
        const existingCount = await db.storyPrompts.count();
        
        // Check if we have the old dataset and need to upgrade
        if (existingCount > 0 && existingCount !== 123) {
            console.log(`Upgrading prompts database from ${existingCount} to 123 prompts (removed inappropriate combinations)`);
            await db.storyPrompts.clear();
        } else if (existingCount === 123) {
            return; // Already has cleaned prompts
        }

        const prompts: Omit<StoryPrompt, 'id'>[] = [
            // FANTASY - CHILDREN (3-8)
            { prompt: "A young dragon who's afraid of flying discovers a magical potion that gives confidence", genre: Genre.FANTASY, audience: Audience.CHILDREN, tags: ['dragon', 'confidence', 'magic'] },
            { prompt: "A talking tree helps forest animals solve their problems with ancient wisdom", genre: Genre.FANTASY, audience: Audience.CHILDREN, tags: ['tree', 'forest', 'wisdom'] },
            { prompt: "A little girl finds a door in her garden that leads to a kingdom of friendly fairies", genre: Genre.FANTASY, audience: Audience.CHILDREN, tags: ['fairies', 'garden', 'kingdom'] },
            { prompt: "A magical paintbrush brings drawings to life, but only for those with pure hearts", genre: Genre.FANTASY, audience: Audience.CHILDREN, tags: ['paintbrush', 'magic', 'drawings'] },
            { prompt: "A unicorn loses its horn and must learn that true magic comes from kindness", genre: Genre.FANTASY, audience: Audience.CHILDREN, tags: ['unicorn', 'kindness', 'magic'] },
            { prompt: "A baby phoenix who can't make fire gets help from a wise old owl", genre: Genre.FANTASY, audience: Audience.CHILDREN, tags: ['phoenix', 'fire', 'owl', 'help'] },

            // FANTASY - PRE-TEEN (9-12)
            { prompt: "A 12-year-old discovers they're the last wizard in a world where magic is forbidden", genre: Genre.FANTASY, audience: Audience.PRE_TEEN, tags: ['wizard', 'forbidden', 'adventure'] },
            { prompt: "Twin siblings inherit opposing magical powers and must work together to save their realm", genre: Genre.FANTASY, audience: Audience.PRE_TEEN, tags: ['twins', 'powers', 'teamwork'] },
            { prompt: "A young knight's quest to prove themselves leads to befriending their supposed enemy", genre: Genre.FANTASY, audience: Audience.PRE_TEEN, tags: ['knight', 'quest', 'friendship'] },
            { prompt: "A magical academy student struggles with spells until they discover their unique gift", genre: Genre.FANTASY, audience: Audience.PRE_TEEN, tags: ['academy', 'spells', 'unique'] },
            { prompt: "A shape-shifter struggles to control their powers while keeping their identity secret at school", genre: Genre.FANTASY, audience: Audience.PRE_TEEN, tags: ['shape-shifter', 'powers', 'secret', 'school'] },
            { prompt: "An apprentice blacksmith forges a legendary sword but must prove worthy to wield it", genre: Genre.FANTASY, audience: Audience.PRE_TEEN, tags: ['blacksmith', 'sword', 'worthy', 'legendary'] },

            // FANTASY - TEEN (13-18)
            { prompt: "A teenager inherits a cursed family grimoire and must break the curse before it consumes them", genre: Genre.FANTASY, audience: Audience.TEEN, tags: ['grimoire', 'curse', 'family', 'inheritance'] },
            { prompt: "Two rival magic users are forced to work together when their worlds literally collide", genre: Genre.FANTASY, audience: Audience.TEEN, tags: ['rivals', 'magic', 'cooperation', 'worlds'] },
            { prompt: "A high school student discovers their dreams can alter reality, but nightmares have consequences", genre: Genre.FANTASY, audience: Audience.TEEN, tags: ['dreams', 'reality', 'nightmares', 'consequences'] },
            { prompt: "A young mage must choose between saving their dying magical world or protecting the human world", genre: Genre.FANTASY, audience: Audience.TEEN, tags: ['mage', 'choice', 'worlds', 'sacrifice'] },
            { prompt: "An outcast teen discovers they're the prophesied bridge between warring magical factions", genre: Genre.FANTASY, audience: Audience.TEEN, tags: ['outcast', 'prophecy', 'factions', 'bridge'] },
            { prompt: "A teenage necromancer struggles with their dark powers while trying to save the people who fear them", genre: Genre.FANTASY, audience: Audience.TEEN, tags: ['necromancer', 'dark powers', 'fear', 'redemption'] },

            // FANTASY - ADULT
            { prompt: "A retired warrior must take up their sword one last time to protect a new generation", genre: Genre.FANTASY, audience: Audience.ADULT, tags: ['retired warrior', 'sword', 'protection'] },
            { prompt: "Magic returns to the modern world, but corporations want to control it", genre: Genre.FANTASY, audience: Audience.ADULT, tags: ['modern magic', 'corporations', 'control'] },
            { prompt: "A middle-aged librarian discovers ancient texts that could reshape the balance of power", genre: Genre.FANTASY, audience: Audience.ADULT, tags: ['librarian', 'ancient texts', 'power', 'balance'] },
            { prompt: "Two former lovers on opposite sides of a magical war must work together to prevent apocalypse", genre: Genre.FANTASY, audience: Audience.ADULT, tags: ['former lovers', 'war', 'cooperation', 'apocalypse'] },
            { prompt: "A disgraced court mage gets one chance at redemption by training the kingdom's last hope", genre: Genre.FANTASY, audience: Audience.ADULT, tags: ['disgraced', 'mage', 'redemption', 'training'] },
            { prompt: "An immortal being tired of eternal life finds purpose in mentoring mortal heroes", genre: Genre.FANTASY, audience: Audience.ADULT, tags: ['immortal', 'eternal life', 'purpose', 'mentoring'] },

            // SCI-FI - CHILDREN (3-8)
            { prompt: "A friendly robot crash-lands in a backyard and needs help fixing their spaceship", genre: Genre.SCI_FI, audience: Audience.CHILDREN, tags: ['robot', 'spaceship', 'friendship'] },
            { prompt: "A time machine in the basement takes kids on educational adventures through history", genre: Genre.SCI_FI, audience: Audience.CHILDREN, tags: ['time travel', 'history', 'learning'] },
            { prompt: "An alien child gets lost on Earth and must learn human customs to find their way home", genre: Genre.SCI_FI, audience: Audience.CHILDREN, tags: ['alien', 'earth', 'customs'] },
            { prompt: "A young inventor creates a device that can talk to animals from other planets", genre: Genre.SCI_FI, audience: Audience.CHILDREN, tags: ['inventor', 'animals', 'planets'] },
            { prompt: "A space puppy with rocket boots helps children explore the galaxy safely", genre: Genre.SCI_FI, audience: Audience.CHILDREN, tags: ['space puppy', 'rocket boots', 'galaxy', 'exploration'] },
            { prompt: "A computer program comes to life and becomes best friends with a lonely child", genre: Genre.SCI_FI, audience: Audience.CHILDREN, tags: ['AI', 'friendship', 'loneliness', 'technology'] },

            // SCI-FI - PRE-TEEN (9-12)
            { prompt: "Kids discover their video game console is actually controlling real spaceships", genre: Genre.SCI_FI, audience: Audience.PRE_TEEN, tags: ['video games', 'spaceships', 'reality', 'responsibility'] },
            { prompt: "A young genius builds a teleporter but accidentally swaps places with their future self", genre: Genre.SCI_FI, audience: Audience.PRE_TEEN, tags: ['genius', 'teleporter', 'future self', 'consequences'] },
            { prompt: "Students at a space academy must work together when their training becomes a real crisis", genre: Genre.SCI_FI, audience: Audience.PRE_TEEN, tags: ['space academy', 'training', 'crisis', 'teamwork'] },
            { prompt: "A kid who can communicate with machines must save the world from a rogue AI", genre: Genre.SCI_FI, audience: Audience.PRE_TEEN, tags: ['machine communication', 'rogue AI', 'save world', 'unique ability'] },
            { prompt: "Time travelers recruit a modern kid to help fix historical timeline disasters", genre: Genre.SCI_FI, audience: Audience.PRE_TEEN, tags: ['time travel', 'recruitment', 'history', 'fixing timelines'] },
            { prompt: "A child prodigy discovers their inventions are being used by aliens to invade Earth", genre: Genre.SCI_FI, audience: Audience.PRE_TEEN, tags: ['prodigy', 'inventions', 'aliens', 'invasion'] },

            // SCI-FI - TEEN (13-18)
            { prompt: "Teenagers wake up on a generation ship with no memory of how they got there", genre: Genre.SCI_FI, audience: Audience.TEEN, tags: ['generation ship', 'memory loss', 'mystery', 'survival'] },
            { prompt: "A high school student's consciousness gets trapped in a virtual reality world", genre: Genre.SCI_FI, audience: Audience.TEEN, tags: ['consciousness', 'virtual reality', 'trapped', 'escape'] },
            { prompt: "Teen hackers discover their government is run by sentient algorithms", genre: Genre.SCI_FI, audience: Audience.TEEN, tags: ['hackers', 'government', 'AI', 'conspiracy'] },
            { prompt: "A young time traveler must prevent their own future without destroying the present", genre: Genre.SCI_FI, audience: Audience.TEEN, tags: ['time travel', 'prevention', 'paradox', 'consequences'] },
            { prompt: "Students at a Mars colony school uncover a conspiracy that threatens both worlds", genre: Genre.SCI_FI, audience: Audience.TEEN, tags: ['Mars colony', 'school', 'conspiracy', 'two worlds'] },
            { prompt: "A teenager with cybernetic implants struggles with their humanity in a digital age", genre: Genre.SCI_FI, audience: Audience.TEEN, tags: ['cybernetics', 'humanity', 'identity', 'technology'] },

            // SCI-FI - ADULT
            { prompt: "A veteran space marine returns to Earth only to find it completely changed", genre: Genre.SCI_FI, audience: Audience.ADULT, tags: ['veteran', 'space marine', 'changed Earth', 'adaptation'] },
            { prompt: "Corporate executives compete for control of the first successful consciousness transfer technology", genre: Genre.SCI_FI, audience: Audience.ADULT, tags: ['corporate', 'consciousness transfer', 'competition', 'ethics'] },
            { prompt: "A rogue scientist must decide whether to reveal technology that could end scarcity or destroy society", genre: Genre.SCI_FI, audience: Audience.ADULT, tags: ['rogue scientist', 'technology', 'sc scarcity', 'society'] },
            { prompt: "First contact with aliens forces humanity to confront its deepest prejudices", genre: Genre.SCI_FI, audience: Audience.ADULT, tags: ['first contact', 'aliens', 'prejudice', 'humanity'] },
            { prompt: "A dying Earth's last hope lies in a controversial experiment to merge human and AI consciousness", genre: Genre.SCI_FI, audience: Audience.ADULT, tags: ['dying Earth', 'experiment', 'human-AI', 'consciousness'] },
            { prompt: "An interstellar diplomat must negotiate peace between species that communicate through completely different means", genre: Genre.SCI_FI, audience: Audience.ADULT, tags: ['diplomat', 'interstellar', 'communication', 'peace'] },

            // MYSTERY - CHILDREN (3-8)
            { prompt: "A child detective solves the case of the missing playground toys", genre: Genre.MYSTERY, audience: Audience.CHILDREN, tags: ['child detective', 'playground', 'toys', 'solving'] },
            { prompt: "Strange noises in the library lead to discovering a family of book-loving mice", genre: Genre.MYSTERY, audience: Audience.CHILDREN, tags: ['library', 'noises', 'mice', 'books'] },
            { prompt: "A young sleuth must figure out why all the flowers in town are changing colors", genre: Genre.MYSTERY, audience: Audience.CHILDREN, tags: ['sleuth', 'flowers', 'colors', 'town'] },
            { prompt: "The mystery of the backwards day where everything happens in reverse", genre: Genre.MYSTERY, audience: Audience.CHILDREN, tags: ['backwards day', 'reverse', 'mystery', 'time'] },
            { prompt: "A little girl investigates why her stuffed animals seem to move when she's not looking", genre: Genre.MYSTERY, audience: Audience.CHILDREN, tags: ['stuffed animals', 'moving', 'investigation', 'imagination'] },
            { prompt: "The case of the singing vegetables in grandma's garden needs solving", genre: Genre.MYSTERY, audience: Audience.CHILDREN, tags: ['vegetables', 'singing', 'garden', 'grandma'] },

            // MYSTERY - PRE-TEEN (9-12)
            { prompt: "Strange things happen at the new school, and only one student notices the pattern", genre: Genre.MYSTERY, audience: Audience.PRE_TEEN, tags: ['school', 'strange', 'pattern'] },
            { prompt: "A young detective must solve the case of the missing neighborhood cats", genre: Genre.MYSTERY, audience: Audience.PRE_TEEN, tags: ['detective', 'missing', 'cats'] },
            { prompt: "Old letters found in the attic reveal a family secret that changes everything", genre: Genre.MYSTERY, audience: Audience.PRE_TEEN, tags: ['letters', 'attic', 'secret'] },
            { prompt: "A middle schooler investigates why students keep sleepwalking to the same mysterious location", genre: Genre.MYSTERY, audience: Audience.PRE_TEEN, tags: ['sleepwalking', 'location', 'mystery', 'investigation'] },
            { prompt: "The mystery of the time capsule that keeps changing its contents overnight", genre: Genre.MYSTERY, audience: Audience.PRE_TEEN, tags: ['time capsule', 'changing', 'overnight', 'mystery'] },
            { prompt: "A young codebreaker must decipher mysterious messages appearing around town", genre: Genre.MYSTERY, audience: Audience.PRE_TEEN, tags: ['codebreaker', 'messages', 'town', 'decipher'] },

            // MYSTERY - TEEN (13-18)
            { prompt: "A high school journalist uncovers a conspiracy that goes deeper than anyone imagined", genre: Genre.MYSTERY, audience: Audience.TEEN, tags: ['journalist', 'conspiracy', 'high school', 'investigation'] },
            { prompt: "Students at a boarding school investigate a series of impossible thefts", genre: Genre.MYSTERY, audience: Audience.TEEN, tags: ['boarding school', 'impossible thefts', 'investigation', 'students'] },
            { prompt: "A teenager must solve their own disappearance after waking up three days in the future", genre: Genre.MYSTERY, audience: Audience.TEEN, tags: ['disappearance', 'time jump', 'memory', 'investigation'] },
            { prompt: "A young hacker discovers that people's digital footprints don't match their real lives", genre: Genre.MYSTERY, audience: Audience.TEEN, tags: ['hacker', 'digital footprints', 'identity', 'mystery'] },
            { prompt: "Strange phenomena at a summer camp force counselors to uncover the truth about the camp's history", genre: Genre.MYSTERY, audience: Audience.TEEN, tags: ['summer camp', 'phenomena', 'history', 'truth'] },
            { prompt: "A teen psychic must determine if their visions of crimes are real or just vivid nightmares", genre: Genre.MYSTERY, audience: Audience.TEEN, tags: ['psychic', 'visions', 'crimes', 'nightmares'] },

            // MYSTERY - ADULT
            { prompt: "A retired detective is pulled back into the case that ended their career", genre: Genre.MYSTERY, audience: Audience.ADULT, tags: ['retired detective', 'career-ending case', 'return', 'unfinished business'] },
            { prompt: "A forensic accountant uncovers financial irregularities that lead to corporate murder", genre: Genre.MYSTERY, audience: Audience.ADULT, tags: ['forensic accountant', 'financial crime', 'corporate murder', 'investigation'] },
            { prompt: "An archivist discovers that historical events have been systematically altered in records", genre: Genre.MYSTERY, audience: Audience.ADULT, tags: ['archivist', 'historical events', 'altered records', 'conspiracy'] },
            { prompt: "A small-town librarian realizes that several missing persons cases are connected by rare books", genre: Genre.MYSTERY, audience: Audience.ADULT, tags: ['librarian', 'missing persons', 'rare books', 'connection'] },
            { prompt: "A crime scene cleaner notices patterns that the police have missed across multiple cases", genre: Genre.MYSTERY, audience: Audience.ADULT, tags: ['crime scene cleaner', 'patterns', 'police', 'serial cases'] },
            { prompt: "An insurance investigator discovers that impossible accidents aren't accidents at all", genre: Genre.MYSTERY, audience: Audience.ADULT, tags: ['insurance investigator', 'impossible accidents', 'conspiracy', 'murder'] },


            // ROMANCE - TEEN (13-18)
            { prompt: "Two high school rivals are forced to work together on the school newspaper and find unexpected chemistry", genre: Genre.ROMANCE, audience: Audience.TEEN, tags: ['high school', 'rivals', 'newspaper', 'chemistry'] },
            { prompt: "A shy bookworm and the popular athlete discover they have more in common than they thought", genre: Genre.ROMANCE, audience: Audience.TEEN, tags: ['bookworm', 'athlete', 'opposites', 'common ground'] },
            { prompt: "Teen entrepreneurs start competing businesses but end up falling for each other", genre: Genre.ROMANCE, audience: Audience.TEEN, tags: ['entrepreneurs', 'competition', 'business', 'falling in love'] },
            { prompt: "Two theater kids from different social circles bond over their shared love of Shakespeare", genre: Genre.ROMANCE, audience: Audience.TEEN, tags: ['theater', 'social circles', 'Shakespeare', 'bonding'] },
            { prompt: "A summer camp counselor romance blooms between two people from completely different backgrounds", genre: Genre.ROMANCE, audience: Audience.TEEN, tags: ['summer camp', 'counselors', 'different backgrounds', 'romance'] },
            { prompt: "Two debate team members must overcome their competitive nature to realize their feelings", genre: Genre.ROMANCE, audience: Audience.TEEN, tags: ['debate team', 'competition', 'overcoming', 'feelings'] },

            // ROMANCE - ADULT
            { prompt: "Two career-focused professionals rediscover love while competing for the same promotion", genre: Genre.ROMANCE, audience: Audience.ADULT, tags: ['career-focused', 'competition', 'promotion', 'rediscovering love'] },
            { prompt: "Childhood sweethearts reunite at their high school reunion after taking very different life paths", genre: Genre.ROMANCE, audience: Audience.ADULT, tags: ['childhood sweethearts', 'reunion', 'different paths', 'second chances'] },
            { prompt: "A workaholic CEO and their new assistant discover that opposites attract in unexpected ways", genre: Genre.ROMANCE, audience: Audience.ADULT, tags: ['workaholic', 'CEO', 'assistant', 'opposites attract'] },
            { prompt: "Two single parents navigate co-parenting and find love in the most unexpected place", genre: Genre.ROMANCE, audience: Audience.ADULT, tags: ['single parents', 'co-parenting', 'unexpected love', 'family'] },
            { prompt: "A successful entrepreneur returns to their hometown and reconnects with their first love", genre: Genre.ROMANCE, audience: Audience.ADULT, tags: ['entrepreneur', 'hometown', 'first love', 'reconnection'] },
            { prompt: "Two rival food truck owners discover that the best recipes come from the heart", genre: Genre.ROMANCE, audience: Audience.ADULT, tags: ['food trucks', 'rivals', 'recipes', 'heart'] },

            // ADVENTURE - CHILDREN (3-8)
            { prompt: "A treasure map found in an old book leads to the adventure of a lifetime", genre: Genre.ADVENTURE, audience: Audience.CHILDREN, tags: ['treasure', 'map', 'adventure'] },
            { prompt: "A group of friends builds a treehouse that becomes their base for neighborhood mysteries", genre: Genre.ADVENTURE, audience: Audience.CHILDREN, tags: ['treehouse', 'friends', 'mysteries'] },
            { prompt: "A lost puppy leads children through a magical forest full of helpful creatures", genre: Genre.ADVENTURE, audience: Audience.CHILDREN, tags: ['puppy', 'forest', 'creatures'] },
            { prompt: "Kids discover a secret passage in their school that leads to an underground world", genre: Genre.ADVENTURE, audience: Audience.CHILDREN, tags: ['school', 'secret', 'underground'] },
            { prompt: "A young explorer discovers a hidden waterfall with a family of friendly bears", genre: Genre.ADVENTURE, audience: Audience.CHILDREN, tags: ['explorer', 'waterfall', 'bears', 'friendship'] },
            { prompt: "Children find an old sailboat and learn to navigate the local lake with help from wise ducks", genre: Genre.ADVENTURE, audience: Audience.CHILDREN, tags: ['sailboat', 'lake', 'navigation', 'ducks'] },

            // ADVENTURE - PRE-TEEN (9-12)
            { prompt: "Young campers must work together to find their way back when they get lost on a hiking trail", genre: Genre.ADVENTURE, audience: Audience.PRE_TEEN, tags: ['campers', 'lost', 'hiking', 'teamwork'] },
            { prompt: "A group of kids discovers an abandoned amusement park and must solve its mysteries", genre: Genre.ADVENTURE, audience: Audience.PRE_TEEN, tags: ['abandoned', 'amusement park', 'mysteries', 'exploration'] },
            { prompt: "Students on a field trip accidentally discover a hidden cave system with ancient secrets", genre: Genre.ADVENTURE, audience: Audience.PRE_TEEN, tags: ['field trip', 'cave system', 'ancient secrets', 'discovery'] },
            { prompt: "A young geocacher stumbles upon clues to a real treasure hidden by a famous explorer", genre: Genre.ADVENTURE, audience: Audience.PRE_TEEN, tags: ['geocaching', 'treasure', 'famous explorer', 'clues'] },
            { prompt: "Kids must navigate a mysterious island after their school boat trip goes off course", genre: Genre.ADVENTURE, audience: Audience.PRE_TEEN, tags: ['mysterious island', 'boat trip', 'navigation', 'survival'] },
            { prompt: "A junior park ranger discovers poachers threatening endangered animals and must stop them", genre: Genre.ADVENTURE, audience: Audience.PRE_TEEN, tags: ['park ranger', 'poachers', 'endangered animals', 'protection'] },

            // ADVENTURE - TEEN (13-18)
            { prompt: "Teenagers discover their town sits on a portal to other dimensions", genre: Genre.ADVENTURE, audience: Audience.TEEN, tags: ['portal', 'dimensions', 'discovery'] },
            { prompt: "A high school band's music has the power to heal emotional wounds", genre: Genre.ADVENTURE, audience: Audience.TEEN, tags: ['band', 'music', 'healing'] },
            { prompt: "Teen exchange students get caught up in international espionage while studying abroad", genre: Genre.ADVENTURE, audience: Audience.TEEN, tags: ['exchange students', 'espionage', 'international', 'abroad'] },
            { prompt: "A group of friends must survive in the wilderness when their wilderness course goes wrong", genre: Genre.ADVENTURE, audience: Audience.TEEN, tags: ['wilderness', 'survival', 'course', 'friends'] },
            { prompt: "Teenage urban explorers discover a conspiracy while exploring abandoned buildings", genre: Genre.ADVENTURE, audience: Audience.TEEN, tags: ['urban explorers', 'conspiracy', 'abandoned buildings', 'discovery'] },
            { prompt: "High school students on a sailing trip must work together when they're stranded on a deserted island", genre: Genre.ADVENTURE, audience: Audience.TEEN, tags: ['sailing', 'stranded', 'deserted island', 'cooperation'] },

            // ADVENTURE - ADULT
            { prompt: "A corporate executive's life changes forever during a mountain climbing expedition gone wrong", genre: Genre.ADVENTURE, audience: Audience.ADULT, tags: ['corporate executive', 'mountain climbing', 'life change', 'survival'] },
            { prompt: "An archaeologist races against time and treasure hunters to protect an ancient discovery", genre: Genre.ADVENTURE, audience: Audience.ADULT, tags: ['archaeologist', 'treasure hunters', 'ancient discovery', 'protection'] },
            { prompt: "A marine biologist must navigate dangerous waters to study a newly discovered species", genre: Genre.ADVENTURE, audience: Audience.ADULT, tags: ['marine biologist', 'dangerous waters', 'new species', 'research'] },
            { prompt: "Former military friends reunite for a extreme sports challenge that tests their limits", genre: Genre.ADVENTURE, audience: Audience.ADULT, tags: ['military friends', 'extreme sports', 'challenge', 'limits'] },
            { prompt: "A travel photographer becomes involved in protecting endangered wildlife in a remote location", genre: Genre.ADVENTURE, audience: Audience.ADULT, tags: ['photographer', 'endangered wildlife', 'remote location', 'protection'] },
            { prompt: "A disaster response team must overcome personal conflicts to save lives during a natural catastrophe", genre: Genre.ADVENTURE, audience: Audience.ADULT, tags: ['disaster response', 'personal conflicts', 'save lives', 'catastrophe'] },

            // CHILDREN'S BOOK - CHILDREN (3-8)
            { prompt: "A shy child learns to make friends by helping others with their talents", genre: Genre.CHILDREN, audience: Audience.CHILDREN, tags: ['shy', 'friends', 'helping'] },
            { prompt: "A little bear who doesn't want to hibernate discovers the magic of winter", genre: Genre.CHILDREN, audience: Audience.CHILDREN, tags: ['bear', 'hibernate', 'winter'] },
            { prompt: "A child who moves to a new town finds courage by joining the local community garden", genre: Genre.CHILDREN, audience: Audience.CHILDREN, tags: ['moving', 'courage', 'garden'] },
            { prompt: "A young artist learns that everyone sees colors differently, and that's what makes art beautiful", genre: Genre.CHILDREN, audience: Audience.CHILDREN, tags: ['artist', 'colors', 'art', 'differences'] },
            { prompt: "A little mouse who's afraid of cats learns that fear can be overcome with understanding", genre: Genre.CHILDREN, audience: Audience.CHILDREN, tags: ['mouse', 'cats', 'fear', 'understanding'] },
            { prompt: "A child who feels too small discovers that size doesn't determine your ability to help others", genre: Genre.CHILDREN, audience: Audience.CHILDREN, tags: ['small', 'size', 'helping others', 'ability'] },


            // Cross-genre prompts for any combination
            { prompt: "An unlikely friendship between two very different characters changes both their lives", genre: 'any' as Genre, audience: 'any' as Audience, tags: ['friendship', 'different', 'change'] },
            { prompt: "A character must overcome their greatest fear to save what they love most", genre: 'any' as Genre, audience: 'any' as Audience, tags: ['fear', 'courage', 'love'] },
            { prompt: "A journey to find something lost leads to discovering something unexpected", genre: 'any' as Genre, audience: 'any' as Audience, tags: ['journey', 'lost', 'discovery'] },
            { prompt: "A character with a special ability must decide whether to hide it or use it to help others", genre: 'any' as Genre, audience: 'any' as Audience, tags: ['ability', 'choice', 'help'] },
            { prompt: "Two enemies are forced to work together and discover they have more in common than they thought", genre: 'any' as Genre, audience: 'any' as Audience, tags: ['enemies', 'cooperation', 'common ground', 'understanding'] },
            { prompt: "A character returns to their childhood home and must confront unresolved issues from the past", genre: 'any' as Genre, audience: 'any' as Audience, tags: ['returning home', 'childhood', 'past', 'resolution'] },
        ];

        await db.storyPrompts.bulkAdd(prompts);
        console.log(`Seeded ${prompts.length} story prompts`);
    } catch (error) {
        console.error('Failed to seed story prompts:', error);
    }
};