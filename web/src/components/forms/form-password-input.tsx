'use client';

import { useState, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FormPasswordInputProps {
  name: string;
  label: string;
  placeholder?: string;
  showStrength?: boolean;
  description?: string;
  disabled?: boolean;
  className?: string;
}

const strengthRules = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'Uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'Lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'Digit', test: (v: string) => /\d/.test(v) },
  { label: 'Special character', test: (v: string) => /[^A-Za-z0-9]/.test(v) },
];

function getStrengthColor(score: number) {
  if (score <= 1) return 'bg-red-500';
  if (score === 2) return 'bg-orange-500';
  if (score === 3) return 'bg-yellow-500';
  return 'bg-green-500';
}

export function FormPasswordInput({
  name,
  label,
  placeholder,
  showStrength,
  description,
  disabled,
  className,
}: FormPasswordInputProps) {
  const { control } = useFormContext();
  const [visible, setVisible] = useState(false);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const value = (field.value as string) ?? '';
        const passed = strengthRules.map((rule) => rule.test(value));
        const score = passed.filter(Boolean).length;

        return (
          <FormItem className={className}>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <div className="relative">
                <Input
                  {...field}
                  type={visible ? 'text' : 'password'}
                  placeholder={placeholder}
                  disabled={disabled}
                  value={value}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setVisible(!visible)}
                  tabIndex={-1}
                >
                  {visible ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </Button>
              </div>
            </FormControl>
            {showStrength && value.length > 0 && (
              <div className="space-y-2 pt-1">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'h-1.5 flex-1 rounded-full transition-colors',
                        i < score ? getStrengthColor(score) : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
                <ul className="space-y-1">
                  {strengthRules.map((rule, i) => (
                    <li
                      key={rule.label}
                      className={cn(
                        'flex items-center gap-1.5 text-xs',
                        passed[i]
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-muted-foreground'
                      )}
                    >
                      {passed[i] ? (
                        <Check className="size-3" />
                      ) : (
                        <X className="size-3" />
                      )}
                      {rule.label}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
