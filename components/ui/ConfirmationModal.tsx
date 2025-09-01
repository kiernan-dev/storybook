import React from 'react';
import Button from './Button';

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    variant?: 'default' | 'destructive';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'default'
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <div className="bg-card/95 backdrop-blur-md border border-border/20 rounded-lg shadow-2xl max-w-md w-full animate-fade-in">
                <div className="p-6">
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                        {title}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                        {message}
                    </p>
                    <div className="flex space-x-3 justify-end">
                        <Button 
                            variant="outline" 
                            onClick={onCancel}
                            className="min-w-[80px]"
                        >
                            {cancelText}
                        </Button>
                        <Button 
                            variant={variant === 'destructive' ? 'destructive' : 'default'}
                            onClick={onConfirm}
                            className="min-w-[80px]"
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;