
import React from 'react';
import { StoryProvider } from './context/StoryContext';
import { useStory } from './hooks/useStory';
import { AppStep } from './types';
import Header from './components/common/Header';
import Stepper from './components/common/Stepper';
import PromptView from './components/views/PromptView';
import EditorView from './components/views/EditorView';
import PreviewView from './components/views/PreviewView';

const AppContent: React.FC = () => {
    const { state } = useStory();

    const renderContent = () => {
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
        <div className="min-h-screen bg-background font-sans antialiased">
            <Header />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
                <div className="max-w-4xl mx-auto">
                    <Stepper currentStep={state.step} />
                    <div className="mt-12">
                        {renderContent()}
                    </div>
                </div>
            </main>
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
