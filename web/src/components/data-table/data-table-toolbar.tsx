'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, Search } from 'lucide-react';
import { useDebounce } from '@/lib/hooks/use-debounce';

interface DataTableToolbarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
}

export function DataTableToolbar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters,
  actions,
}: DataTableToolbarProps) {
  const [localValue, setLocalValue] = useState(searchValue);
  const debouncedValue = useDebounce(localValue, 300);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(searchValue);
  }, [searchValue]);

  // Emit debounced changes
  useEffect(() => {
    if (debouncedValue !== searchValue) {
      onSearchChange?.(debouncedValue);
    }
  }, [debouncedValue]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 items-center gap-2">
        {onSearchChange && (
          <div className="relative w-full max-w-sm">
            <Search className="text-muted-foreground absolute left-2.5 top-1/2 size-4 -translate-y-1/2" />
            <Input
              placeholder={searchPlaceholder}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              className="pl-8"
            />
            {localValue && (
              <Button
                variant="ghost"
                size="icon-xs"
                className="absolute right-1.5 top-1/2 -translate-y-1/2"
                onClick={() => {
                  setLocalValue('');
                  onSearchChange?.('');
                }}
              >
                <X className="size-3" />
                <span className="sr-only">Clear search</span>
              </Button>
            )}
          </div>
        )}
        {filters}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
