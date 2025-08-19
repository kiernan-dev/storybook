
import React from 'react';
import { APP_NAME } from '../../constants';
import ThemeToggle from '../ui/ThemeToggle';

const Header: React.FC = () => {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <div className="mr-4 flex">
                    <a className="mr-6 flex items-center space-x-2" href="/">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
                        <span className="font-bold">{APP_NAME}</span>
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-end space-x-2">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
};

export default Header;
