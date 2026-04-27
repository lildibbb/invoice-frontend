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
import { cn } from '@/lib/utils';

interface FormNumberInputProps {
  name: string;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function FormNumberInput({
  name,
  label,
  min,
  max,
  step,
  prefix,
  placeholder,
  description,
  disabled,
  className,
}: FormNumberInputProps) {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className={cn('flex items-center', prefix && 'relative')}>
              {prefix && (
                <span className="absolute left-3 text-sm text-muted-foreground pointer-events-none">
                  {prefix}
                </span>
              )}
              <Input
                type="number"
                min={min}
                max={max}
                step={step}
                placeholder={placeholder}
                disabled={disabled}
                className={cn(prefix && 'pl-10')}
                value={field.value ?? ''}
                onChange={(e) => {
                  const val = e.target.value;
                  field.onChange(val === '' ? '' : Number(val));
                }}
                onBlur={field.onBlur}
                name={field.name}
                ref={field.ref}
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
