'use client';

import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ProductComboboxProps {
  items: { value: string; label: string }[];
  value: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}

export function ProductCombobox({
  items,
  value,
  onSelect,
  placeholder = 'Select a product...',
}: ProductComboboxProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, search]);

  const selectedLabel = items.find((i) => i.value === value)?.label;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-9 font-normal text-sm"
        >
          <span className="truncate">
            {selectedLabel ?? placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 text-sm"
          />
        </div>
        <div className="max-h-[200px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 text-sm text-muted-foreground">No products found.</p>
          ) : (
            filtered.map((item) => (
              <button
                key={item.value}
                type="button"
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-1.5 text-sm hover:bg-accent cursor-pointer',
                  value === item.value && 'bg-accent'
                )}
                onClick={() => {
                  onSelect(item.value);
                  setOpen(false);
                  setSearch('');
                }}
              >
                <Check
                  className={cn(
                    'h-3.5 w-3.5 shrink-0',
                    value === item.value ? 'opacity-100' : 'opacity-0'
                  )}
                />
                <span className="truncate">{item.label}</span>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
