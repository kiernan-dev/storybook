
import React, { useState, useEffect } from 'react';
import { APP_NAME } from '../../constants';
import ThemeToggle from '../ui/ThemeToggle';
import ApiStatus from '../ui/ApiStatus';
import SavedStories from '../ui/SavedStories';
import ApiSettings from '../ui/ApiSettings';
import DemoBanner from '../ui/DemoBanner';
import Button from '../ui/Button';
import { checkApiConnection } from '../../services/aiService';
import { isDemoMode } from '../../services/mockData';

const Header: React.FC = () => {
    const [isApiConnected, setIsApiConnected] = useState<boolean>(false);
    const [isChecking, setIsChecking] = useState<boolean>(true);
    const [showSavedStories, setShowSavedStories] = useState<boolean>(false);
    const [showApiSettings, setShowApiSettings] = useState<boolean>(false);
    const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

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

    useEffect(() => {
        checkConnection();
        
        // Check API status every 5 minutes
        const interval = setInterval(checkConnection, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, []);

    return (
    <>
        {/* Demo Mode Banner */}
        {isDemoMode() && (
            <DemoBanner 
                onOpenSettings={() => setShowApiSettings(true)}
                className="sticky top-0 z-50"
            />
        )}
        
        <header className={`sticky z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${isDemoMode() ? 'top-[60px]' : 'top-0'}`}>
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center space-x-6">
                        <a className="flex items-center space-x-3" href="/">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                            <span className="font-bold text-lg">{APP_NAME}</span>
                        </a>
                        {!isChecking && !isDemoMode() && <ApiStatus isConnected={isApiConnected} />}
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
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowApiSettings(true)}
                            className="p-2"
                            title="Settings"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </Button>
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
                                setShowApiSettings(true);
                                setShowMobileMenu(false);
                            }}
                            className="w-full justify-start text-sm font-medium"
                        >
                            Settings
                        </Button>
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
        
        {showApiSettings && (
            <ApiSettings 
                isOpen={showApiSettings} 
                onClose={() => {
                    setShowApiSettings(false);
                    // Recheck connection after settings change
                    checkConnection();
                }} 
            />
        )}
    </>
    );
};

export default Header;
