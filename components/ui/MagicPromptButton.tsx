import React, { useState } from 'react';
import { Genre, Audience } from '../../types';
import { getRandomPrompt, seedStoryPrompts } from '../../services/database';
import Button from './Button';
import Spinner from './Spinner';

interface MagicPromptButtonProps {
    genre: Genre;
    audience: Audience;
    onPromptGenerated: (prompt: string) => void;
    disabled?: boolean;
}

const MagicWandIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M15 4V2a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v2"/>
        <path d="M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2"/>
        <circle cx="12" cy="12" r="3"/>
        <path d="m12 1 3 6H9l3-6z"/>
        <path d="M12 23s8-4 8-9c0-5-3.58-9-8-9s-8 4-8 9c0 5 8 9 8 9z"/>
    </svg>
);

const SparkleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        <path d="M5 3v4"/>
        <path d="M19 17v4"/>
        <path d="M3 5h4"/>
        <path d="M17 19h4"/>
    </svg>
);

const MagicPromptButton: React.FC<MagicPromptButtonProps> = ({ 
    genre, 
    audience, 
    onPromptGenerated, 
    disabled = false 
}) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [sparkle, setSparkle] = useState(false);
    const [lastUsedPromptId, setLastUsedPromptId] = useState<number | undefined>(undefined);

    const handleMagicClick = async () => {
        setIsGenerating(true);
        setSparkle(true);

        try {
            // Add a small delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800));
            
            const result = await getRandomPrompt(genre, audience, lastUsedPromptId);
            
            if (typeof result === 'string') {
                // Fallback case
                onPromptGenerated(result);
            } else {
                // Normal case with ID
                onPromptGenerated(result.prompt);
                setLastUsedPromptId(result.id);
            }
        } catch (error) {
            console.error('Failed to generate magic prompt:', error);
            onPromptGenerated('A magical story waiting to be discovered...');
        } finally {
            setIsGenerating(false);
            setTimeout(() => setSparkle(false), 500);
        }
    };

    return (
        <Button
            variant="outline"
            onClick={handleMagicClick}
            disabled={disabled || isGenerating}
            className={`
                relative overflow-hidden transition-all duration-300 
                ${sparkle ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-400' : ''}
                hover:bg-gradient-to-r hover:from-purple-500/5 hover:to-pink-500/5
                hover:border-purple-300 hover:shadow-lg
            `}
        >
            <div className="flex items-center space-x-2">
                {isGenerating ? (
                    <>
                        <Spinner className="h-4 w-4" />
                        <span>Conjuring...</span>
                    </>
                ) : (
                    <>
                        <SparkleIcon className={`transition-transform duration-300 ${sparkle ? 'rotate-12 scale-110' : ''}`} />
                        <span className="font-medium">Magic Prompt</span>
                    </>
                )}
            </div>
            
            {/* Sparkle animation overlay */}
            {sparkle && (
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-2 left-4 w-1 h-1 bg-yellow-400 rounded-full animate-ping opacity-75" />
                    <div className="absolute top-4 right-6 w-1 h-1 bg-purple-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '0.2s' }} />
                    <div className="absolute bottom-3 left-8 w-1 h-1 bg-pink-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.4s' }} />
                    <div className="absolute bottom-2 right-4 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-40" style={{ animationDelay: '0.6s' }} />
                </div>
            )}
        </Button>
    );
};

export default MagicPromptButton;