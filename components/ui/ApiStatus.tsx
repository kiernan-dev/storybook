import React from 'react';

interface ApiStatusProps {
    isConnected: boolean;
    className?: string;
}

const ApiStatus: React.FC<ApiStatusProps> = ({ isConnected, className = '' }) => {
    return (
        <div className={`flex items-center space-x-2 ${className}`}>
            <div className={`
                relative flex h-2 w-2 rounded-full
                ${isConnected ? 'bg-green-500' : 'bg-red-500'}
            `}>
                {isConnected && (
                    <div className="absolute inset-0 h-2 w-2 rounded-full bg-green-400 animate-ping opacity-75" />
                )}
            </div>
            <span className={`
                text-xs font-medium
                ${isConnected ? 'text-green-600' : 'text-red-600'}
            `}>
                {isConnected ? 'Connected' : 'API ERROR'}
            </span>
        </div>
    );
};

export default ApiStatus;