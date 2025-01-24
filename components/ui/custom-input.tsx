import React from 'react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ error, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <Input
          ref={ref}
          className={cn(
            error && 'border-destructive',
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

CustomInput.displayName = 'CustomInput'; 