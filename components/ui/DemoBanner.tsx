import React from 'react';
import Button from './Button';

interface DemoBannerProps {
    onOpenSettings?: () => void;
    className?: string;
}

const DemoBanner: React.FC<DemoBannerProps> = ({ onOpenSettings, className = '' }) => {
    return (
        <div className={`bg-gradient-to-r from-amber-500/90 to-orange-500/90 text-white shadow-lg ${className}`}>
            <div className="container mx-auto px-4 py-2 sm:py-3">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6">
                    <div className="flex items-center gap-2">
                        <svg className="h-5 w-5 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <span className="font-semibold text-sm whitespace-nowrap">DEMO MODE</span>
                    </div>
                    <div className="flex-1 text-center px-2 sm:px-4">
                        <span className="text-xs sm:text-sm">
                            You're viewing <strong>static sample content</strong> - not AI generated.
                            <span className="hidden sm:inline"><br />Configure your API key to enable real AI story generation.</span>
                        </span>
                    </div>
                    {onOpenSettings && (
                        <Button
                            onClick={onOpenSettings}
                            variant="outline"
                            size="sm"
                            className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 shrink-0"
                        >
                            Setup API Key
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DemoBanner;