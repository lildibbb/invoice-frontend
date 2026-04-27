import { type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-16 text-center',
      className
    )}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 mb-4">
        <Icon className="h-7 w-7 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-[#0F172A] mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 max-w-xs mb-6">{description}</p>
      )}
      {action && (
        <Button size="sm" onClick={action.onClick} className="bg-[#3B82F6] hover:bg-[#2563EB]">
          {action.label}
        </Button>
      )}
    </div>
  );
}
