import React, { useState, useEffect } from 'react';

const LoadingView: React.FC = () => {
    const [currentTextIndex, setCurrentTextIndex] = useState(0);
    
    const loadingTexts = [
        "Crafting magical worlds...",
        "Breathing life into characters...",
        "Weaving storylines together...",
        "Painting vivid scenes...",
        "Sprinkling narrative magic...",
        "Building adventure paths...",
        "Creating memorable moments...",
        "Polishing every detail...",
        "Bringing imagination to life...",
        "Almost ready for you...",
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTextIndex(prev => (prev + 1) % loadingTexts.length);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="rounded-lg border border-border/20 bg-card/50 p-8 backdrop-blur-sm min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center justify-center text-center w-full">
                <h2 className="text-2xl font-bold text-foreground mb-8">
                    Generating Your Story...
                </h2>
                
                <div className="relative w-full max-w-lg mb-6 overflow-hidden rounded-full">
                    <div className="h-4 bg-muted/30 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 animate-shimmer rounded-full"></div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer-glow rounded-full overflow-hidden"></div>
                </div>

                <div className="h-8 flex items-center justify-center">
                    <p 
                        key={currentTextIndex}
                        className="text-sm text-muted-foreground italic animate-fade-in"
                    >
                        {loadingTexts[currentTextIndex]}
                    </p>
                </div>
                
                <div className="flex space-x-2 mt-4">
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse-dot" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse-dot" style={{animationDelay: '300ms'}}></div>
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-pulse-dot" style={{animationDelay: '600ms'}}></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingView;
