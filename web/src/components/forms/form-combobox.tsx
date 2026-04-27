'use client';

import { useRef, useState, useMemo, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface FormComboboxProps {
  name: string;
  label: string;
  items: { value: string; label: string; description?: string }[];
  placeholder?: string;
  searchPlaceholder?: string;
  description?: string;
  disabled?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function FormCombobox({
  name,
  label,
  items,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  description,
  disabled,
  emptyMessage = 'No results found.',
  className,
}: FormComboboxProps) {
  const { control, setValue } = useFormContext();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const parentRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.value.toLowerCase().includes(q) ||
        item.label.toLowerCase().includes(q) ||
        (item.description?.toLowerCase().includes(q) ?? false)
    );
  }, [items, search]);

  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 5,
  });

  const handleSelect = useCallback(
    (value: string) => {
      setValue(name, value, { shouldValidate: true });
      setOpen(false);
      setSearch('');
    },
    [name, setValue]
  );

  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setValue(name, '', { shouldValidate: true });
      setSearch('');
    },
    [name, setValue]
  );

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selectedItem = items.find((item) => item.value === field.value);

        return (
          <FormItem className={cn('flex flex-col', className)}>
            <FormLabel>{label}</FormLabel>
            <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) setSearch(''); }}>
              <FormControl>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                      'w-full justify-between font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    <span className="truncate">
                      {selectedItem
                        ? selectedItem.value !== selectedItem.label
                          ? `[${selectedItem.value}] ${selectedItem.label}`
                          : selectedItem.label
                        : placeholder}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      {field.value && (
                        <X
                          className="size-4 opacity-50 hover:opacity-100"
                          onClick={handleClear}
                        />
                      )}
                      <ChevronsUpDown className="size-4 opacity-50" />
                    </div>
                  </Button>
                </PopoverTrigger>
              </FormControl>
              <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                <div className="flex items-center border-b px-3">
                  <Input
                    placeholder={searchPlaceholder}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 border-0 shadow-none focus-visible:ring-0 px-0"
                  />
                </div>
                <div
                  ref={parentRef}
                  className="max-h-[300px] overflow-y-auto p-1"
                >
                  {filtered.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">
                      {emptyMessage}
                    </p>
                  ) : (
                    <div
                      style={{
                        height: `${virtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                      }}
                    >
                      {virtualizer.getVirtualItems().map((virtualRow) => {
                        const item = filtered[virtualRow.index];
                        const isSelected = field.value === item.value;

                        return (
                          <div
                            key={item.value}
                            className={cn(
                              'absolute left-0 right-0 flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm select-none',
                              isSelected
                                ? 'bg-accent text-accent-foreground'
                                : 'hover:bg-accent hover:text-accent-foreground'
                            )}
                            style={{
                              height: `${virtualRow.size}px`,
                              transform: `translateY(${virtualRow.start}px)`,
                            }}
                            onClick={() => handleSelect(item.value)}
                          >
                            <Check
                              className={cn(
                                'size-4 shrink-0',
                                isSelected ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div className="flex-1 truncate">
                              {item.value !== item.label ? (
                                <>
                                  <span className="font-medium">{item.value}</span>
                                  <span className="text-muted-foreground ml-2">
                                    {item.label}
                                  </span>
                                </>
                              ) : (
                                <span>{item.label}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
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
