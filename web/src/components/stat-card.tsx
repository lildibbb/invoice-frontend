import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: { value: string; positive: boolean };
  accentColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  accentColor = 'gradient-blue',
  className,
}: StatCardProps) {
  return (
    <Card className={cn('glass-card overflow-hidden border-0 hover:shadow-2xl transition-all duration-200', className)}>
      <div className={cn('h-1 w-full', accentColor)} />
      <CardContent className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-[32px] font-bold leading-tight tracking-tight">{value}</p>
            {subtitle && (
              <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <p className={cn(
                'mt-1 text-xs font-medium',
                trend.positive ? 'text-emerald-600' : 'text-red-600'
              )}>
                {trend.positive ? '↑' : '↓'} {trend.value}
              </p>
            )}
          </div>
          {Icon && (
            <div className="ml-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
