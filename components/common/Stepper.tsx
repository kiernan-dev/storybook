
import React from 'react';
import { AppStep } from '../../types';

interface StepperProps {
    currentStep: AppStep;
}

const steps = [
    { id: AppStep.PROMPT, name: 'Create Story' },
    { id: AppStep.EDITING, name: 'Edit & Illustrate' },
    { id: AppStep.PREVIEW, name: 'Preview & Export' },
];

const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
    return (
        <div className="mb-12">
            <nav aria-label="Progress" className="max-w-2xl mx-auto">
                <ol role="list" className="flex items-center justify-center">
                    {steps.map((step, stepIdx) => (
                        <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-16 sm:pr-24 md:pr-32' : ''}`}>
                            <div className="flex flex-col items-center space-y-3">
                                {step.id < currentStep ? (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
                                        <span className="text-primary-foreground font-semibold">{step.id}</span>
                                    </div>
                                ) : step.id === currentStep ? (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background">
                                        <span className="text-primary font-semibold">{step.id}</span>
                                    </div>
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-border bg-background">
                                        <span className="text-muted-foreground font-semibold">{step.id}</span>
                                    </div>
                                )}
                                
                                <span className={`text-sm font-medium text-center max-w-24 ${
                                    step.id <= currentStep ? 'text-primary' : 'text-muted-foreground'
                                }`}>
                                    {step.name}
                                </span>
                            </div>
                        </li>
                    ))}
                </ol>
            </nav>
        </div>
    );
};

export default Stepper;
