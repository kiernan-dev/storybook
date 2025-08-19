
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
            <main className="container mx-auto px-4 py-8">
                <Stepper currentStep={state.step} />
                <div className="mt-8">
                    {renderContent()}
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
