'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Monitor, LogOut } from 'lucide-react';

import { RoleGuard } from '@/components/role-guard';
import { MembershipRole, GlobalRole } from '@/lib/types/roles';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDateTime } from '@/lib/utils';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useSessions, useRevokeSession, useRevokeAllSessions } from '@/lib/queries/settings';

export default function SessionsPage() {
  const { data: sessions, isLoading } = useSessions();
  const revokeSession = useRevokeSession();
  const revokeAll = useRevokeAllSessions();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const router = useRouter();

  const handleRevoke = async (jti: string) => {
    try {
      await revokeSession.mutateAsync(jti);
      toast.success('Session revoked');
    } catch {
      toast.error('Failed to revoke session');
    }
  };

  const handleRevokeAll = async () => {
    try {
      await revokeAll.mutateAsync();
      clearAuth();
      router.push('/login');
    } catch {
      toast.error('Failed to revoke sessions');
    }
  };

  const sessionList: any[] = Array.isArray(sessions) ? sessions : (sessions as any)?.data ?? [];

  return (
    <RoleGuard roles={[MembershipRole.ADMIN, MembershipRole.STAFF, GlobalRole.SUPER_ADMIN]}>
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Active Sessions"
        description="Manage your active login sessions"
        actions={
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={sessionList.length === 0}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout All Devices
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Logout All Devices</AlertDialogTitle>
                <AlertDialogDescription>
                  This will log you out of all devices including this one. You will need to log in again.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleRevokeAll}>Revoke All</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Sessions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : sessionList.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No active sessions</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device / Browser</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessionList.map((session: any) => (
                  <TableRow key={session.jti ?? session.id}>
                    <TableCell className="font-medium">
                      {session.userAgent ?? session.device ?? 'Unknown device'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {session.ipAddress ?? session.ip ?? '-'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(session.lastActiveAt ?? session.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={session.isCurrent ? 'default' : 'secondary'}>
                        {session.isCurrent ? 'Current' : 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {!session.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          disabled={revokeSession.isPending}
                          onClick={() => handleRevoke(session.jti ?? session.id)}
                        >
                          Revoke
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
    </RoleGuard>
  );
}
