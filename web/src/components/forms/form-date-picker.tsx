'use client';

import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

interface FormDatePickerProps {
  name: string;
  label: string;
  placeholder?: string;
  description?: string;
  disabled?: boolean;
  maxFutureDays?: number;
  className?: string;
}

export function FormDatePicker({
  name,
  label,
  placeholder = 'Pick a date',
  description,
  disabled,
  maxFutureDays,
  className,
}: FormDatePickerProps) {
  const { control } = useFormContext();
  const [open, setOpen] = useState(false);

  const disabledDates = maxFutureDays != null
    ? { after: addDays(new Date(), maxFutureDays) }
    : undefined;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const dateValue = field.value ? new Date(field.value) : undefined;

        return (
          <FormItem className={cn('flex flex-col', className)}>
            <FormLabel>{label}</FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <FormControl>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={disabled}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="size-4 mr-2" />
                    {dateValue
                      ? format(dateValue, 'd MMM yyyy')
                      : placeholder}
                  </Button>
                </PopoverTrigger>
              </FormControl>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateValue}
                  onSelect={(date) => {
                    field.onChange(date ? format(date, 'yyyy-MM-dd') : '');
                    setOpen(false);
                  }}
                  disabled={disabledDates}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
