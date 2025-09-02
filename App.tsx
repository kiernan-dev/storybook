
import React, { useState, useEffect } from 'react';
import { StoryProvider } from './context/StoryContext';
import { useStory } from './hooks/useStory';
import { AppStep } from './types';
import Header from './components/common/Header';
import Stepper from './components/common/Stepper';
import PromptView from './components/views/PromptView';
import EditorView from './components/views/EditorView';
import PreviewView from './components/views/PreviewView';
import LoadingView from './components/views/LoadingView';

const AppContent: React.FC = () => {
    const { state } = useStory();
    const [showBackToTop, setShowBackToTop] = useState(false);

    const handleScroll = () => {
        if (state.step === AppStep.PREVIEW) {
            // Show button when title page is halfway out of view (assuming title page is ~70vh)
            const titlePageHeight = window.innerHeight * 0.7 * 0.5;
            setShowBackToTop(window.scrollY > titlePageHeight);
        } else {
            // Ensure the button is hidden on other steps
            setShowBackToTop(false);
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [state.step]); // Re-evaluate when the step changes

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderContent = () => {
        if (state.isLoading) {
            return <LoadingView />;
        }
        switch (state.step) {
            case AppStep.PROMPT:
                return <PromptView />;
            case AppStep.EDITING:
                return <EditorView />;
            case AppStep.PREVIEW:
                return <PreviewView />;
            default:
                return <PromptView />;
        }
    };

    return (
        <div>
            <Header />
            <main className="px-4 md:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto py-8">
                    <Stepper currentStep={state.step} />
                    <div className="mt-8">
                        <div key={state.step} className="animate-fade-in">
                            {renderContent()}
                        </div>
                    </div>
                </div>
            </main>

            {/* Floating Back to Top Button - Placed outside the transformed parent */}
            <button
                onClick={scrollToTop}
                className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full shadow-lg transition-all duration-300 ease-in-out
                    ${showBackToTop ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
                aria-label="Back to top"
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
            </button>
        </div>
    );
};

const App: React.FC = () => {
    return (
        <StoryProvider>
            <AppContent />
        </StoryProvider>
    );
};

export default App;
