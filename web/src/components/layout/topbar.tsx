'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Settings, LogOut, User, ChevronRight, Building2, ChevronsUpDown, Check, Menu, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/use-auth';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useUIStore } from '@/lib/stores/ui-store';
import { useMyCompanies } from '@/lib/queries/companies';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Route label mapping for breadcrumbs
const ROUTE_LABELS: Record<string, string> = {
  '': 'Dashboard',
  'invoices': 'Invoices',
  'new': 'New',
  'customers': 'Customers',
  'products': 'Products',
  'quotations': 'Quotations',
  'recurring': 'Recurring',
  'payments': 'Payments',
  'approvals': 'Approvals',
  'e-invoices': 'E-Invoices',
  'reports': 'Reports',
  'settings': 'Settings',
  'team': 'Team',
  'lhdn': 'LHDN',
  'billing': 'Billing',
  'templates': 'Templates',
  'tax': 'Tax',
  'sessions': 'Sessions',
  'superadmin': 'Superadmin',
  'users': 'Users',
  'audit': 'Audit',
  'subscriptions': 'Subscriptions',
};

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  // Skip breadcrumbs on root dashboard
  if (segments.length === 0) {
    return <span className="text-sm font-semibold text-[#0F172A]">Dashboard</span>;
  }

  // Build crumb paths
  const crumbs = segments.map((seg, i) => {
    const href = '/' + segments.slice(0, i + 1).join('/');
    // If UUID-like (has dashes and 36 chars), show abbreviated version
    const label = seg.length === 36 && seg.includes('-')
      ? seg.substring(0, 8) + '...'
      : ROUTE_LABELS[seg] ?? seg;
    return { label, href, isLast: i === segments.length - 1 };
  });

  return (
    <nav className="flex items-center gap-1" aria-label="Breadcrumb">
      <Link href="/" className="text-sm text-slate-500 hover:text-[#0F172A] transition-colors">
        Dashboard
      </Link>
      {crumbs.map(({ label, href, isLast }) => (
        <div key={href} className="flex items-center gap-1">
          <ChevronRight className="h-4 w-4 text-slate-300" />
          {isLast ? (
            <span className="text-sm font-semibold text-[#0F172A]">{label}</span>
          ) : (
            <Link href={href} className="text-sm text-slate-500 hover:text-[#0F172A] transition-colors">
              {label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}

function CompanySwitcher() {
  const context = useAuthStore((s) => s.context);
  const { switchCompany } = useAuth();
  const { data: companiesData, isLoading } = useMyCompanies();

  const companies = Array.isArray(companiesData)
    ? companiesData
    : (companiesData as any)?.data ?? [];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hidden sm:flex items-center gap-2 h-8 px-3 text-slate-700 hover:bg-slate-50 shadow-sm"
        >
          <Building2 className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-xs font-medium max-w-[120px] truncate">
            {context?.company?.name ?? 'Select company'}
          </span>
          <ChevronsUpDown className="h-3 w-3 text-slate-400 flex-shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2" align="end">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 px-2 py-1">Switch workspace</p>
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            </div>
          ) : companies.length === 0 ? (
            <p className="text-xs text-slate-400 px-2 py-2">No other workspaces</p>
          ) : (
            companies.map((c: any) => {
              const isActive = c.uuid === context?.company?.uuid || c.id === context?.company?.uuid;
              return (
                <button
                  key={c.uuid ?? c.id}
                  type="button"
                  onClick={() => !isActive && switchCompany(c.uuid ?? c.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm transition-colors text-left',
                    isActive ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                  )}
                >
                  <div className="w-7 h-7 rounded-lg bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                    {(c.name ?? '?').charAt(0).toUpperCase()}
                  </div>
                  <span className="flex-1 truncate font-medium">{c.name}</span>
                  {isActive && <Check className="h-3.5 w-3.5 flex-shrink-0" />}
                </button>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function Topbar() {
  const { user, userInitials, displayName, logout } = useAuth();
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen);
  const router = useRouter();

  return (
    <header className="flex h-16 shrink-0 items-center justify-between bg-white shadow-sm px-4 lg:px-6">
      {/* Left: hamburger + breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-8 w-8 shrink-0"
          onClick={() => setMobileSidebarOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Breadcrumbs />
      </div>

      {/* Right: company switcher + bell + avatar */}
      <div className="flex items-center gap-2 shrink-0">
        <CompanySwitcher />

        {/* Notifications bell */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-slate-500 hover:text-slate-900"
          onClick={() => {}}
        >
          <Bell className="h-4 w-4" />
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-[#3B82F6] text-white text-xs font-semibold">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel className="pb-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-[#3B82F6] text-white text-sm font-semibold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A] truncate">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/settings')}>
              <User className="mr-2 h-4 w-4 text-slate-500" />
              Profile & Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-red-600 focus:text-red-600 focus:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
