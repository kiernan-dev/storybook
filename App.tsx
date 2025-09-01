
import React from 'react';
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
