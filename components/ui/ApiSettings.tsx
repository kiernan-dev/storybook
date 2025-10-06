import React, { useState, useEffect } from 'react';
import Button from './Button';
import { Card } from './Card';
import Input from './Input';
import { AI_PROVIDER, getApiKey, setApiKey, checkApiConnection } from '../../services/aiService';

interface ApiSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

const ApiSettings: React.FC<ApiSettingsProps> = ({ isOpen, onClose }) => {
    const [apiKey, setApiKeyState] = useState(getApiKey() || '');
    const [isConnecting, setIsConnecting] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSave = () => {
        setApiKey(apiKey);
        onClose();
    };

    const handleDisconnect = () => {
        setApiKey('');
        setApiKeyState('');
        setConnectionStatus('idle');
        onClose();
    };

    const handleTestConnection = async () => {
        setIsConnecting(true);
        setConnectionStatus('idle');
        
        // Temporarily save settings for testing
        setApiKey(apiKey);
        
        try {
            const success = await checkApiConnection();
            setConnectionStatus(success ? 'success' : 'error');
        } catch (error) {
            setConnectionStatus('error');
        } finally {
            setIsConnecting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-card border border-border">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-card-foreground mb-4">OpenRouter API Settings</h2>
                    
                    <div className="space-y-4">
                        {/* Provider Info */}
                        <div className="bg-muted/50 p-3 rounded-md border border-border">
                            <h3 className="text-sm font-semibold text-card-foreground mb-2">{AI_PROVIDER.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                <strong>Text Model:</strong> {AI_PROVIDER.defaultModel}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                <strong>Image Model:</strong> {AI_PROVIDER.imageModel}
                            </p>
                        </div>

                        {/* API Key */}
                        <div>
                            <label className="block text-sm font-medium text-card-foreground mb-2">
                                OpenRouter API Key
                            </label>
                            <Input
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKeyState(e.target.value)}
                                placeholder="Enter your OpenRouter API key"
                                className="w-full"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">openrouter.ai/keys</a>
                            </p>
                        </div>

                        {/* Test Connection */}
                        <div>
                            <Button
                                onClick={handleTestConnection}
                                disabled={!apiKey || isConnecting}
                                variant="outline"
                                className="w-full"
                            >
                                {isConnecting ? 'Testing...' : 'Test Connection'}
                            </Button>
                            
                            {connectionStatus === 'success' && (
                                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                                    ✅ Connection successful!
                                </p>
                            )}
                            
                            {connectionStatus === 'error' && (
                                <p className="text-sm text-destructive mt-2">
                                    ❌ Connection failed. Check your API key and settings.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="space-y-3 mt-6">
                        {apiKey && (
                            <Button
                                onClick={handleDisconnect}
                                variant="outline"
                                className="w-full text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/20"
                            >
                                Disconnect & Use Demo Mode
                            </Button>
                        )}
                        <div className="flex gap-3">
                            <Button
                                onClick={onClose}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                className="flex-1"
                            >
                                Save
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default ApiSettings;