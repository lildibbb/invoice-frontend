'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/stores/ui-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { navGroups, superadminNavGroup, type NavItem } from './nav-items';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

function NavLink({
  item,
  isActive,
  collapsed,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClick?: () => void;
}) {
  const link = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-[rgba(59,130,246,0.12)] text-white shadow-sm shadow-blue-500/20'
          : 'text-slate-400 hover:bg-white/5 hover:text-slate-200',
        collapsed && 'justify-center px-2'
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate">{item.title}</span>}
      {!collapsed && item.badge && (
        <span className="ml-auto rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300">
          {item.badge}
        </span>
      )}
    </Link>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {item.title}
        </TooltipContent>
      </Tooltip>
    );
  }

  return link;
}

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen);
  const userRole = useAuthStore((s) => s.user?.role)?.toUpperCase();
  const contextRole = useAuthStore((s) => s.context?.role)?.toUpperCase();

  const companyName = useAuthStore((s) => s.context?.company?.name);
  const userName = useAuthStore((s) => s.user?.name);

  const matchRole = (r: string) => r.toUpperCase() === userRole || r.toUpperCase() === contextRole;

  const allGroups = [...navGroups, superadminNavGroup].reduce<typeof navGroups>((acc, group) => {
    if (group.requiredRoles?.length && !group.requiredRoles.some(matchRole)) {
      return acc;
    }
    const filteredItems = group.items.filter(item =>
      !item.requiredRoles?.length || item.requiredRoles.some(matchRole)
    );
    if (filteredItems.length > 0) {
      acc.push({ ...group, items: filteredItems });
    }
    return acc;
  }, []);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col bg-[#0F172A] transition-all duration-200 lg:static',
          collapsed ? 'w-16' : 'w-60',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-16 items-center px-4 shrink-0',
            collapsed && 'justify-center px-2'
          )}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center flex-shrink-0">
              <FileText className="h-4 w-4 text-white" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-white tracking-tight">InvoiZ</span>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-4 px-2">
            {allGroups.map((group) => (
              <div key={group.title}>
                {!collapsed && (
                  <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-600">
                    {group.title}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => (
                    <NavLink
                      key={item.href}
                      item={item}
                      isActive={
                        item.href === '/'
                          ? pathname === '/'
                          : pathname.startsWith(item.href)
                      }
                      collapsed={collapsed}
                      onClick={() => setMobileSidebarOpen(false)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </ScrollArea>

        {/* Workspace info */}
        {companyName && !collapsed && (
          <div className="mx-2 mb-1 rounded-lg bg-white/5 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Workspace</p>
            <p className="text-sm font-medium text-white truncate">{companyName}</p>
            {userName && (
              <p className="text-xs text-slate-400 truncate mt-0.5">{userName}</p>
            )}
          </div>
        )}

        {/* Collapse toggle */}
        <div className="hidden p-2 lg:block">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-slate-400 hover:bg-white/5 hover:text-slate-200"
            onClick={toggleSidebar}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
