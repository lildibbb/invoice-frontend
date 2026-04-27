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
import { Input } from '@/components/ui/input';

interface FormInputProps {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  maxLength?: number;
  transform?: 'uppercase' | 'lowercase';
  type?: string;
  disabled?: boolean;
  className?: string;
}

export function FormInput({
  name,
  label,
  placeholder,
  description,
  maxLength,
  transform,
  type = 'text',
  disabled,
  className,
}: FormInputProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              maxLength={maxLength}
              value={field.value ?? ''}
              onChange={(e) => {
                let val = e.target.value;
                if (transform === 'uppercase') val = val.toUpperCase();
                if (transform === 'lowercase') val = val.toLowerCase();
                field.onChange(val);
              }}
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
