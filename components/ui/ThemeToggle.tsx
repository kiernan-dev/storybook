
import React from 'react';
import { useStory } from '../../hooks/useStory';
import Button from './Button';

const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
);
const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3a6.364 6.364 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);

const ThemeToggle: React.FC = () => {
    const { state, dispatch } = useStory();
    const isDark = state.theme === 'flash-era';

    const toggleTheme = () => {
        const themes = ['flash-era', 'flash-era-light'];
        const currentIndex = themes.indexOf(state.theme);
        const nextTheme = themes[(currentIndex + 1) % themes.length] as 'flash-era' | 'flash-era-light';
        dispatch({ type: 'SET_THEME', payload: nextTheme });
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-600 dark:bg-gray-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            role="switch"
            aria-checked={isDark}
            aria-label="Toggle theme"
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                    isDark ? 'translate-x-6' : 'translate-x-1'
                }`}
            />
            <SunIcon className={`absolute left-1 h-3 w-3 text-orange-600 transition-opacity duration-200 ${
                isDark ? 'opacity-0' : 'opacity-100'
            }`} />
            <MoonIcon className={`absolute right-1 h-3 w-3 text-slate-600 transition-opacity duration-200 ${
                isDark ? 'opacity-100' : 'opacity-0'
            }`} />
        </button>
    );
};

export default ThemeToggle;
