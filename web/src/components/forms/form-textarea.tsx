'use client';

import { useFormContext } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

interface FormTextareaProps {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  maxLength?: number;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

export function FormTextarea({
  name,
  label,
  placeholder,
  description,
  maxLength,
  rows,
  disabled,
  className,
}: FormTextareaProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              {...field}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              rows={rows}
              value={field.value ?? ''}
            />
          </FormControl>
          <div className="flex items-center justify-between">
            {description && <FormDescription>{description}</FormDescription>}
            {maxLength && (
              <span className="text-xs text-muted-foreground ml-auto">
                {(field.value?.length ?? 0)}/{maxLength}
              </span>
            )}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
