import OpenAI from 'openai';
import { Story, Chapter, Genre, Audience } from '../types';
import { textToHtml } from '../utils/textFormatter';
import { getMockStory, getMockImageForChapter, getMockEnhancedPrompt, isDemoMode } from './mockData';

// Provider configurations
export interface AIProvider {
    name: string;
    baseURL: string;
    defaultModel: string;
    supportsImages: boolean;
    imageModel?: string;
}

export const AI_PROVIDER = {
    name: 'OpenRouter',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'anthropic/claude-sonnet-4.5',
    supportsImages: true,
    imageModel: 'google/gemini-2.5-flash-image-preview'
};

// Storage helpers
export const getApiKey = (): string | null => {
    return localStorage.getItem('ai_api_key');
};

export const setApiKey = (key: string): void => {
    localStorage.setItem('ai_api_key', key);
};

export const getProvider = (): string => {
    return 'openrouter';
};

export const getModel = (): string => {
    return AI_PROVIDER.defaultModel;
};

// Create OpenAI client instance
const createOpenAIClient = (): OpenAI | null => {
    const apiKey = getApiKey();
    
    if (!apiKey) return null;
    
    return new OpenAI({
        apiKey,
        baseURL: AI_PROVIDER.baseURL,
        dangerouslyAllowBrowser: true
    });
};

// Test API connection
export const checkApiConnection = async (): Promise<boolean> => {
    try {
        // In demo mode, always return true (no API check needed)
        if (isDemoMode()) {
            return true;
        }

        const client = createOpenAIClient();
        if (!client) {
            console.error("No API configuration available");
            return false;
        }
        
        const apiKey = getApiKey();
        console.log(`Checking ${AI_PROVIDER.name} connection with key:`, apiKey ? `${apiKey.substring(0, 10)}...` : 'none');
        
        // Simple test call
        const response = await client.chat.completions.create({
            model: getModel(),
            messages: [{ role: 'user', content: 'Hello' }],
            max_tokens: 10
        });
        
        console.log("API connection check successful:", response.choices[0]?.message.content);
        return true;
    } catch (error) {
        console.error("API connection check failed:", error);
        return false;
    }
};

// Story generation tool for structured output (OpenRouter format)
const storyTool = {
    type: 'function' as const,
    function: {
        name: 'generate_story',
        description: 'Generate a complete story with title and chapters',
        parameters: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    description: 'The title of the story'
                },
                chapters: {
                    type: 'array',
                    description: 'An array of chapters',
                    items: {
                        type: 'object',
                        properties: {
                            title: {
                                type: 'string',
                                description: 'The chapter title'
                            },
                            content: {
                                type: 'string',
                                description: 'The full chapter content'
                            }
                        },
                        required: ['title', 'content']
                    }
                }
            },
            required: ['title', 'chapters']
        }
    }
};

// Generate story
export const generateStory = async (
    prompt: string,
    genre: Genre,
    audience: Audience
): Promise<Story> => {
    // Check if we're in demo mode (no API key)
    if (isDemoMode()) {
        // Simulate API delay for realistic demo experience
        await new Promise(resolve => setTimeout(resolve, 2000));
        return getMockStory(genre, audience);
    }

    try {
        const client = createOpenAIClient();
        if (!client) {
            throw new Error("No API configuration. Please configure your API settings.");
        }

        const fullPrompt = `You are a world-class author. Write a concise, engaging story based on the following prompt.

Prompt: "${prompt}"
Genre: ${genre}
Target Audience: ${audience}

Requirements:
- Generate a compelling title and exactly 5 chapters
- Each chapter should be 3-8 paragraphs (concise but complete)
- Focus on key plot points and character development
- Keep the story engaging but not overly detailed
- Suitable for ${audience} audience in ${genre} genre`;

        const response = await client.chat.completions.create({
            model: getModel(),
            messages: [{ role: 'user', content: fullPrompt }],
            tools: [storyTool],
            tool_choice: { type: 'function', function: { name: 'generate_story' } }
        });

        const toolCall = response.choices[0]?.message.tool_calls?.[0];
        if (!toolCall || toolCall.type !== 'function' || !toolCall.function?.arguments) {
            throw new Error("No story generated");
        }

        const parsedStory = JSON.parse(toolCall.function.arguments) as {
            title: string;
            chapters: { title: string; content: string }[];
        };

        return {
            title: parsedStory.title,
            genre,
            audience,
            chapters: parsedStory.chapters.map((chapter, index) => ({
                id: `chapter-${index}-${Date.now()}`,
                title: chapter.title,
                content: textToHtml(chapter.content),
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

// Generate image for chapter
export const generateImageForChapter = async (
    chapterContent: string,
    customPrompt?: string
): Promise<string> => {
    // Check if we're in demo mode (no API key)
    if (isDemoMode()) {
        return getMockImageForChapter(chapterContent);
    }

    try {
        const client = createOpenAIClient();
        if (!client || !AI_PROVIDER.supportsImages) {
            throw new Error("Image generation not supported with current provider");
        }

        // First generate an image prompt
        const imagePromptResponse = await client.chat.completions.create({
            model: getModel(),
            messages: [{
                role: 'user',
                content: `Based on the following chapter text, create a short, visually descriptive prompt for an image generation AI. The prompt should be a single sentence describing a key scene, character, or setting. Focus on creating a beautiful, illustrative style suitable for a storybook.

Chapter Text: "${chapterContent}"`
            }],
            max_tokens: 100
        });

        const baseImagePrompt = imagePromptResponse.choices[0]?.message.content?.trim() || '';
        const finalPrompt = customPrompt 
            ? `children's storybook illustration style, ${baseImagePrompt}, ${customPrompt}`
            : `children's storybook illustration style, ${baseImagePrompt}`;

        // Generate the actual image using OpenRouter's image model
        const imageModel = AI_PROVIDER.imageModel;
        
        // Use OpenRouter's chat completions endpoint for image generation with modalities
        const imageResponse = await client.chat.completions.create({
            model: imageModel,
            messages: [{
                role: 'user',
                content: finalPrompt
            }],
            modalities: ['image', 'text'] as any,
            max_tokens: 1500
        } as any);
        
        // Extract the base64 image from the response
        const message = (imageResponse.choices[0]?.message as any);
        console.log('Image response message:', JSON.stringify(message, null, 2));
        
        if (message?.images && message.images.length > 0) {
            const imageData = message.images[0];
            console.log('Image data:', imageData);
            
            // Handle different possible response formats
            if (typeof imageData === 'string') {
                return imageData;
            } else if (imageData?.image_url?.url) {
                // OpenRouter format: {type: 'image_url', image_url: {url: 'data:image/...'}}
                return imageData.image_url.url;
            } else if (imageData?.url) {
                return imageData.url;
            } else if (imageData?.data) {
                return imageData.data;
            } else if (imageData?.base64) {
                return `data:image/png;base64,${imageData.base64}`;
            }
            
            console.error('Unexpected image data format:', imageData);
            throw new Error("Invalid image data format received");
        }
        
        throw new Error("No image data received from provider");
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image for the chapter.");
    }
};

// Generate magic prompt
export const generateMagicPrompt = async (currentPrompt: string): Promise<string> => {
    // Check if we're in demo mode (no API key)
    if (isDemoMode()) {
        return getMockEnhancedPrompt(currentPrompt);
    }

    try {
        const client = createOpenAIClient();
        if (!client) {
            throw new Error("No API configuration. Please configure your API settings.");
        }

        const enhancementPrompt = `You are a creative assistant. Your task is to take a user's story idea and make it more vivid, imaginative, and detailed.
Expand on the original idea, adding interesting characters, settings, and plot twists, but keep the core concept intact.
The output should be a single paragraph.

Original idea: "${currentPrompt}"

Enhanced idea:`;

        const response = await client.chat.completions.create({
            model: getModel(),
            messages: [{ role: 'user', content: enhancementPrompt }],
            max_tokens: 200
        });

        return response.choices[0]?.message.content?.trim() || currentPrompt;
    } catch (error) {
        console.error("Error generating magic prompt:", error);
        throw new Error("Failed to enhance the prompt. Please try again.");
    }
};