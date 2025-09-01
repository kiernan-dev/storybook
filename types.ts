
export interface Chapter {
    id: string;
    title: string;
    content: string;
    imagePrompt: string;
    imageUrl: string | null;
    isGeneratingImage: boolean;
}

export interface Story {
    title: string;
    chapters: Chapter[];
}

export enum AppStep {
    PROMPT = 1,
    EDITING = 2,
    PREVIEW = 3,
}

export interface AppState {
    story: Story | null;
    step: AppStep;
    isLoading: boolean;
    error: string | null;
    theme: 'flash-era' | 'flash-era-light';
}

export type Action =
    | { type: 'SET_STORY'; payload: Story }
    | { type: 'UPDATE_CHAPTER'; payload: { chapterId: string; content: string } }
    | { type: 'SET_STEP'; payload: AppStep }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_IMAGE_URL'; payload: { chapterId: string; url: string } }
    | { type: 'SET_GENERATING_IMAGE'; payload: { chapterId: string; isGenerating: boolean } }
    | { type: 'SET_THEME'; payload: 'flash-era' | 'flash-era-light' }
    | { type: 'SAVE_STORY_SUCCESS'; payload: { storyId: number } };

export enum Genre {
    FANTASY = 'Fantasy',
    SCI_FI = 'Science Fiction',
    MYSTERY = 'Mystery',
    ROMANCE = 'Romance',
    CHILDREN = "Children's Book",
    ADVENTURE = 'Adventure',
}

export enum Audience {
    CHILDREN = 'Children (3-8)',
    PRE_TEEN = 'Pre-teen (9-12)',
    TEEN = 'Teenagers (13-18)',
    ADULT = 'Adults',
}
