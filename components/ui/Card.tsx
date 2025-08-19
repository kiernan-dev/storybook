
import React from 'react';

const Card: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (
  <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className || ''}`}>
    {children}
  </div>
);

const CardHeader: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className || ''}`}>
    {children}
  </div>
);

const CardTitle: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (
  <h3 className={`text-2xl font-semibold leading-none tracking-tight ${className || ''}`}>
    {children}
  </h3>
);

const CardDescription: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (
  <p className={`text-sm text-muted-foreground ${className || ''}`}>
    {children}
  </p>
);

const CardContent: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (
  <div className={`p-6 pt-0 ${className || ''}`}>
    {children}
  </div>
);

const CardFooter: React.FC<{ className?: string, children: React.ReactNode }> = ({ className, children }) => (
  <div className={`flex items-center p-6 pt-0 ${className || ''}`}>
    {children}
  </div>
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
