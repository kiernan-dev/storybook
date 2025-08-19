
import { GoogleGenAI, Type } from '@google/genai';
import { Story, Chapter, Genre, Audience } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

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

export const generateStory = async (prompt: string, genre: Genre, audience: Audience): Promise<Story> => {
    try {
        const fullPrompt = `
            You are a world-class author. Write a complete story based on the following prompt.
            The story should be engaging and well-structured with multiple chapters.
            
            Prompt: "${prompt}"
            Genre: ${genre}
            Target Audience: ${audience}
            
            Generate a title and at least 5 chapters. Each chapter should have a title and substantial content.
            Return the story in the specified JSON format.
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: storySchema,
            },
        });
        
        const jsonText = response.text.trim();
        const parsedStory = JSON.parse(jsonText) as { title: string, chapters: { title: string, content: string }[] };

        return {
            title: parsedStory.title,
            chapters: parsedStory.chapters.map((chapter, index) => ({
                id: `chapter-${index}-${Date.now()}`,
                title: chapter.title,
                content: chapter.content,
                imagePrompt: '',
                imageUrl: null,
                isGeneratingImage: false,
            })),
        };
    } catch (error) {
        console.error("Error generating story:", error);
        throw new Error("Failed to generate story. Please try again.");
    }
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
