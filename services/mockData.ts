import { Story, Chapter, Genre, Audience } from '../types';
import { textToHtml } from '../utils/textFormatter';

// Demo images for storybook illustrations
const DEMO_IMAGES = [
    '/demo-images/fantasy_1.png',      // Luna finding the crystal
    '/demo-images/fantasy_2.png',      // Tiny dragon appearing
    '/demo-images/fantasy_3.png',      // Girl and dragon with map
    '/demo-images/fantasy_4.png',      // Phoenix in the sky
    '/demo-images/fantasy_5.png',      // Girl with full-sized dragon
    '/demo-images/mystery_1.png',      // Archivist with empty cases
    '/demo-images/mystery_2.png',      // Documents on desk
    '/demo-images/mystery_3.png',      // Woman with flashlight
    '/demo-images/mystery_4.png',      // Two people in secret room
    '/demo-images/mystery_5.png'       // Archivists at computers
];

const MOCK_STORIES: Record<string, Story> = {
    'fantasy-children': {
        title: "Luna and the Crystal Dragon",
        genre: Genre.FANTASY,
        audience: Audience.CHILDREN,
        chapters: [
            {
                id: "demo-ch-1",
                title: "The Magical Discovery",
                content: textToHtml("Luna was playing in her grandmother's garden when she found a glowing crystal hidden under the old oak tree. The crystal was warm to the touch and sparkled with colors she had never seen before. As she held it up to the sunlight, a tiny voice whispered, 'Help me, please!' Luna looked around but saw no one. The voice was coming from inside the crystal!"),
                imagePrompt: "A young girl finding a glowing crystal in a magical garden",
                imageUrl: DEMO_IMAGES[0],
                isGeneratingImage: false
            },
            {
                id: "demo-ch-2", 
                title: "Meeting Sparkle",
                content: textToHtml("The crystal began to glow brighter, and suddenly, a miniature dragon no bigger than Luna's hand appeared in a puff of silver smoke. 'I'm Sparkle,' said the dragon, stretching his tiny wings. 'I've been trapped in that crystal for a hundred years!' Luna couldn't believe her eyes. A real dragon! Sparkle explained that an evil wizard had shrunk him and trapped him, and only a kind heart could set him free."),
                imagePrompt: "A tiny silver dragon appearing from a crystal with sparkles of magic",
                imageUrl: DEMO_IMAGES[1],
                isGeneratingImage: false
            },
            {
                id: "demo-ch-3",
                title: "The Quest Begins", 
                content: textToHtml("'To return me to my full size,' Sparkle explained, 'we need to find three magical items: a feather from the Cloud Phoenix, a pearl from the Singing Mermaid, and a flower from the Laughing Tree.' Luna's eyes widened with excitement. This sounded like the greatest adventure ever! 'I'll help you,' she said bravely. 'But how do we find these magical creatures?' Sparkle smiled and pointed his tiny claw toward the sky."),
                imagePrompt: "A girl and tiny dragon looking at a magical map of their quest",
                imageUrl: DEMO_IMAGES[2],
                isGeneratingImage: false
            },
            {
                id: "demo-ch-4",
                title: "The Cloud Phoenix",
                content: textToHtml("They flew on Sparkle's back (even though he was small, he was still strong enough to carry Luna through the clouds). High above the world, they found the Cloud Phoenix building her nest from wisps of clouds and starlight. 'I will give you a feather,' said the Phoenix in a voice like gentle thunder, 'but first, you must help me find my lost chick who fell into the Storm Cloud.' Luna and Sparkle looked at each other. Another adventure!"),
                imagePrompt: "A majestic phoenix made of clouds speaking to a girl and tiny dragon in the sky",
                imageUrl: DEMO_IMAGES[3],
                isGeneratingImage: false
            },
            {
                id: "demo-ch-5",
                title: "Friendship Wins",
                content: textToHtml("After helping the Phoenix, the Mermaid, and the Laughing Tree, Luna and Sparkle had collected all three magical items. As soon as they brought them together, there was a brilliant flash of light! Sparkle grew back to his proper size - magnificent and beautiful, with scales that shimmered like jewels. 'Thank you, dear friend,' Sparkle said. 'You have the greatest magic of all - a kind and brave heart.' From that day on, Luna and Sparkle had many more adventures together, always helping those in need."),
                imagePrompt: "A girl standing next to a magnificent full-sized dragon in a magical forest clearing",
                imageUrl: DEMO_IMAGES[4],
                isGeneratingImage: false
            }
        ]
    },
    'mystery-adult': {
        title: "The Archivist's Secret",
        genre: Genre.MYSTERY,
        audience: Audience.ADULT,
        chapters: [
            {
                id: "demo-mystery-1",
                title: "The Missing Documents",
                content: textToHtml("Dr. Sarah Chen had worked at the National Archives for fifteen years, but she'd never seen anything like this. Three separate historical documents from different centuries had vanished overnight, despite the building's state-of-the-art security system. The surveillance footage showed nothing unusual - just empty corridors and locked doors. Yet somehow, between the 11 PM security check and 6 AM opening, the documents had simply disappeared."),
                imagePrompt: "A concerned archivist examining empty document cases in a secure archive",
                imageUrl: DEMO_IMAGES[5],
                isGeneratingImage: false
            },
            {
                id: "demo-mystery-2",
                title: "The Pattern Emerges",
                content: textToHtml("Sarah spent the weekend researching the missing documents. On the surface, they seemed unrelated: a 16th-century land deed, a Civil War soldier's diary, and a 1920s shipping manifest. But as she dug deeper, she discovered something chilling. All three documents contained references to the same geographic coordinates - coordinates that led to a small town that had been abandoned for over fifty years. Someone wanted these specific documents, and they had the resources to breach one of the most secure facilities in the country."),
                imagePrompt: "Documents and maps spread across a desk under lamplight showing mysterious connections",
                imageUrl: DEMO_IMAGES[6],
                isGeneratingImage: false
            },
            {
                id: "demo-mystery-3",
                title: "The Midnight Visitor",
                content: textToHtml("Sarah decided to work late, hoping to catch whoever was behind the thefts. At midnight, she heard footsteps in the archive basement - footsteps that shouldn't exist, as she was supposedly alone in the building. Armed with only her phone's flashlight, she followed the sound downstairs. What she found there would change everything she thought she knew about her workplace. Behind a false wall, someone had built a complete duplicate archive, filled with perfect forgeries of the world's most important historical documents."),
                imagePrompt: "A woman with a flashlight discovering a hidden room full of document forgeries",
                imageUrl: DEMO_IMAGES[7],
                isGeneratingImage: false
            },
            {
                id: "demo-mystery-4",
                title: "Uncovering the Truth",
                content: textToHtml("The forger wasn't a thief - he was a guardian. Sarah met Dr. Marcus Petrov, a former colleague who had faked his own death five years earlier. He revealed that a shadow organization had been systematically stealing and destroying historical documents that revealed inconvenient truths about powerful families and corporations. The missing documents contained evidence of a massive fraud spanning centuries. Marcus had been secretly replacing the originals with forgeries to protect the truth from being erased forever."),
                imagePrompt: "Two people meeting in a secret room surrounded by historical documents and evidence",
                imageUrl: DEMO_IMAGES[8],
                isGeneratingImage: false
            },
            {
                id: "demo-mystery-5",
                title: "The Guardian's Legacy",
                content: textToHtml("Sarah faced an impossible choice: expose the conspiracy and risk her career and safety, or help Marcus continue his secret mission to preserve history. In the end, they found a third way. Working together, they created a encrypted digital archive, hidden in plain sight within the official database. The stolen documents were secretly digitized and distributed to trusted historians worldwide. The shadow organization never realized that their efforts to erase history had only ensured its permanent preservation. Sometimes the greatest mysteries are solved not by revealing secrets, but by protecting them."),
                imagePrompt: "Two archivists working together at computers, preserving digital documents in a secure archive",
                imageUrl: DEMO_IMAGES[9],
                isGeneratingImage: false
            }
        ]
    }
};

export const getMockStory = (genre: Genre, audience: Audience): Story => {
    // Try to find an exact match first
    const key = `${genre.toLowerCase()}-${audience.toLowerCase()}`;
    if (MOCK_STORIES[key]) {
        return MOCK_STORIES[key];
    }
    
    // Fallback to any story that matches genre or audience
    const fallback = Object.values(MOCK_STORIES).find(story => 
        story.genre === genre || story.audience === audience
    );
    
    if (fallback) {
        return {
            ...fallback,
            genre,
            audience,
            title: `Demo: ${fallback.title} (${genre} - ${audience})`
        };
    }
    
    // Final fallback to first available story
    const firstStory = Object.values(MOCK_STORIES)[0];
    return {
        ...firstStory,
        genre,
        audience,
        title: `Demo: Sample Story (${genre} - ${audience})`
    };
};

export const getMockImageForChapter = async (chapterContent: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return a random demo image
    const randomIndex = Math.floor(Math.random() * DEMO_IMAGES.length);
    return DEMO_IMAGES[randomIndex];
};

export const getMockEnhancedPrompt = async (currentPrompt: string): Promise<string> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const enhancements = [
        `${currentPrompt} Set in a mystical forest where ancient trees whisper secrets and magical creatures roam freely under moonlit skies.`,
        `${currentPrompt} The story unfolds in a bustling steampunk city where clockwork inventions and steam-powered machines create a world of endless possibilities.`,
        `${currentPrompt} Taking place in a coastal town where the ocean holds mysteries and every sunset brings new adventures waiting to be discovered.`,
        `${currentPrompt} Set in a library that exists between dimensions, where books contain living worlds and stories have the power to change reality.`,
        `${currentPrompt} The adventure begins in a floating castle above the clouds, where sky pirates and wind dancers navigate between floating islands.`
    ];
    
    const randomIndex = Math.floor(Math.random() * enhancements.length);
    return enhancements[randomIndex];
};

export const isDemoMode = (): boolean => {
    return !localStorage.getItem('ai_api_key');
};