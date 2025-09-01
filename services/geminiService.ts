
import { GoogleGenAI, Type } from '@google/genai';
import { Story, Chapter, Genre, Audience, Action } from '../types';
import { Dispatch } from 'react';
import { LOADING_STEPS } from '../constants';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY || API_KEY === 'undefined') {
    throw new Error("VITE_GEMINI_API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const checkApiConnection = async (): Promise<boolean> => {
    try {
        console.log("Checking API connection with key:", API_KEY ? `${API_KEY.substring(0, 10)}...` : 'undefined');
        
        // Simple test call to check API connectivity
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "Hello",
            config: {
                maxOutputTokens: 10,
            },
        });
        
        console.log("API connection check successful:", response.text);
        // If we get here without an error, the API is connected
        return true;
    } catch (error) {
        console.error("API connection check failed:", error);
        return false;
    }
};

const storySchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "The title of the story."
        },
        chapters: {
            type: Type.ARRAY,
            description: "An array of chapters, each with a title and content.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "The title of the chapter."
                    },
                    content: {
                        type: Type.STRING,
                        description: "The full text content of the chapter."
                    }
                },
                required: ["title", "content"]
            }
        }
    },
    required: ["title", "chapters"]
};

export const generateStory = async (
    prompt: string, 
    genre: Genre, 
    audience: Audience,
    dispatch: Dispatch<Action>
): Promise<Story> => {
    // MOCK API CALL with stepped progress
    for (let i = 0; i < LOADING_STEPS.length; i++) {
        dispatch({ type: 'SET_LOADING_STEP', payload: i });
        await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    const mockStory: Story = {
        title: 'Mock Story',
        chapters: [
            { id: '1', title: 'Chapter 1', content: 'This is a mock chapter.', imagePrompt: '', imageUrl: null, isGeneratingImage: false },
            { id: '2', title: 'Chapter 2', content: 'This is another mock chapter.', imagePrompt: '', imageUrl: null, isGeneratingImage: false },
        ],
    };

    return mockStory;
};

export const generateImageForChapter = async (chapterContent: string): Promise<string> => {
    try {
        const imagePromptGenResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Based on the following chapter text, create a short, visually descriptive and artistic prompt for an image generation AI. The prompt should be a single sentence and describe a key scene, character, or setting. Focus on creating a beautiful, illustrative style suitable for a storybook.

            Chapter Text: "${chapterContent}"`,
        });

        const imagePrompt = imagePromptGenResponse.text.trim();
        
        const imageResponse = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: `children's storybook illustration style, ${imagePrompt}`,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
                aspectRatio: '1:1',
            },
        });
        
        const base64ImageBytes: string = imageResponse.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64ImageBytes}`;
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image for the chapter.");
    }
};

export const generateMagicPrompt = async (currentPrompt: string): Promise<string> => {
    try {
        const enhancementPrompt = `
            You are a creative assistant. Your task is to take a user's story idea and make it more vivid, imaginative, and detailed.
            Expand on the original idea, adding interesting characters, settings, and plot twists, but keep the core concept intact.
            The output should be a single paragraph.

            Original idea: "${currentPrompt}"

            Enhanced idea:
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: enhancementPrompt,
        });

        return response.text.trim();
    } catch (error) {
        console.error("Error generating magic prompt:", error);
        throw new Error("Failed to enhance the prompt. Please try again.");
    }
};
