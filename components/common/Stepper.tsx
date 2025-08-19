
import React from 'react';
import { AppStep } from '../../types';

interface StepperProps {
    currentStep: AppStep;
}

const steps = [
    { id: AppStep.PROMPT, name: '1. Create Story' },
    { id: AppStep.EDITING, name: '2. Edit & Illustrate' },
    { id: AppStep.PREVIEW, name: '3. Preview & Export' },
];

const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
    return (
        <nav aria-label="Progress">
            <ol role="list" className="flex items-center">
                {steps.map((step, stepIdx) => (
                    <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                        {step.id < currentStep ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-primary" />
                                </div>
                                <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                                    <span className="text-primary-foreground">{step.id}</span>
                                </div>
                                <span className="absolute top-10 w-max -left-2 text-sm font-medium text-primary">{step.name}</span>
                            </>
                        ) : step.id === currentStep ? (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-border" />
                                </div>
                                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background">
                                    <span className="text-primary">{step.id}</span>
                                </div>
                                <span className="absolute top-10 w-max -left-2 text-sm font-medium text-primary">{step.name}</span>
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="h-0.5 w-full bg-border" />
                                </div>
                                <div className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background">
                                    <span className="text-muted-foreground">{step.id}</span>
                                </div>
                                <span className="absolute top-10 w-max -left-2 text-sm font-medium text-muted-foreground">{step.name}</span>
                            </>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Stepper;
