
import React, { useState, useEffect } from 'react';
import { APP_NAME } from '../../constants';
import ThemeToggle from '../ui/ThemeToggle';
import ApiStatus from '../ui/ApiStatus';
import SavedStories from '../ui/SavedStories';
import Button from '../ui/Button';
import { checkApiConnection } from '../../services/geminiService';

const Header: React.FC = () => {
    const [isApiConnected, setIsApiConnected] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(true);
    const [showSavedStories, setShowSavedStories] = useState<boolean>(false);
    const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

    useEffect(() => {
        const checkConnection = async () => {
            setIsChecking(true);
            try {
                const connected = await checkApiConnection();
                setIsApiConnected(connected);
            } catch (error) {
                setIsApiConnected(false);
            } finally {
                setIsChecking(false);
            }
        };

        checkConnection();
        
        // Check API status every 5 minutes
        const interval = setInterval(checkConnection, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
    <>
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <a className="flex items-center space-x-3" href="/">
                            <span className="font-mono text-sm font-semibold text-primary">KIERNAN[ai]</span>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                            <span className="font-bold text-lg">{APP_NAME}</span>
                        </a>
                        {!isChecking && <ApiStatus isConnected={isApiConnected} />}
                    </div>
                    
                    {/* Desktop menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowSavedStories(true)}
                            className="text-sm font-medium"
                        >
                            My Stories
                        </Button>
                        <ThemeToggle />
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="p-2"
                        >
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showMobileMenu ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile menu dropdown */}
            {showMobileMenu && (
                <div className="md:hidden border-t border-border/40 bg-background/95 backdrop-blur">
                    <div className="container mx-auto px-4 py-4 space-y-3">
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                                setShowSavedStories(true);
                                setShowMobileMenu(false);
                            }}
                            className="w-full justify-start text-sm font-medium"
                        >
                            My Stories
                        </Button>
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Theme</span>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            )}
        </header>
        
        {showSavedStories && (
            <SavedStories onClose={() => setShowSavedStories(false)} />
        )}
    </>
    );
};

export default Header;
