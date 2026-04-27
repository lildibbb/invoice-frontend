'use client';

import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
  disabled?: boolean;
}

export function SubmitButton({
  children,
  isLoading,
  loadingText = 'Saving...',
  variant = 'default',
  className,
  disabled,
}: SubmitButtonProps) {
  const { formState: { isValid, isSubmitting } } = useFormContext();
  const loading = isLoading || isSubmitting;

  return (
    <Button
      type="submit"
      variant={variant}
      className={className}
      disabled={disabled || loading || !isValid}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
