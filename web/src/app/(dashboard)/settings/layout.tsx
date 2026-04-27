'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Building2, Users, FileText, CreditCard, FileCode, Calculator, Shield } from 'lucide-react';

const settingsNav = [
  { title: 'Company', href: '/settings', icon: Building2 },
  { title: 'Team', href: '/settings/team', icon: Users },
  { title: 'LHDN', href: '/settings/lhdn', icon: Shield },
  { title: 'Billing', href: '/settings/billing', icon: CreditCard },
  { title: 'Templates', href: '/settings/templates', icon: FileText },
  { title: 'Tax', href: '/settings/tax', icon: Calculator },
  { title: 'Sessions', href: '/settings/sessions', icon: FileCode },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex gap-8">
      <aside className="w-56 shrink-0">
        <h2 className="mb-4 text-lg font-semibold">Settings</h2>
        <nav className="flex flex-col gap-1">
          {settingsNav.map((item) => {
            const isActive =
              item.href === '/settings'
                ? pathname === '/settings'
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
