'use client';

import { useState, useMemo, useCallback } from 'react';
import { type ColumnDef, type PaginationState } from '@tanstack/react-table';
import { toast } from 'sonner';
import {
  UserPlus,
  Ban,
  RotateCcw,
  Trash2,
} from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { DataTable } from '@/components/data-table';
import { StatusBadge } from '@/components/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { RoleGuard } from '@/components/role-guard';
import { GlobalRole } from '@/lib/types/roles';
import {
  useAdminUsers,
  useInviteAdmin,
  useSuspendUser,
  useRestoreUser,
  useSuperadminUser,
} from '@/lib/queries/superadmin';

export default function SuperadminUsersPage() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [suspendUuid, setSuspendUuid] = useState<string | null>(null);
  const [restoreUuid, setRestoreUuid] = useState<string | null>(null);
  const [deleteUuid, setDeleteUuid] = useState<string | null>(null);
  const [detailUuid, setDetailUuid] = useState<string | null>(null);

  const { data, isLoading } = useAdminUsers({
    page: pagination.pageIndex + 1,
    limit: pagination.pageSize,
  });

  const users = useMemo(() => {
    if (Array.isArray(data)) return data;
    return data?.data ?? [];
  }, [data]);

  const totalRecords = data?.meta?.total ?? data?.total ?? users.length;
  const pageCount = Math.ceil(totalRecords / pagination.pageSize) || 1;

  const { data: userDetail, isLoading: userDetailLoading } = useSuperadminUser(detailUuid ?? '');

  const inviteMutation = useInviteAdmin();
  const suspendMutation = useSuspendUser();
  const restoreMutation = useRestoreUser();

  const handleInvite = useCallback(async () => {
    if (!inviteEmail) return;
    try {
      await inviteMutation.mutateAsync({ email: inviteEmail });
      toast.success('Admin invited successfully');
      setShowInvite(false);
      setInviteEmail('');
    } catch {
      toast.error('Failed to invite admin');
    }
  }, [inviteEmail, inviteMutation]);

  const handleSuspend = useCallback(async () => {
    if (!suspendUuid) return;
    try {
      await suspendMutation.mutateAsync(suspendUuid);
      toast.success('User suspended');
    } catch {
      toast.error('Failed to suspend user');
    }
    setSuspendUuid(null);
  }, [suspendUuid, suspendMutation]);

  const handleRestore = useCallback(async () => {
    if (!restoreUuid) return;
    try {
      await restoreMutation.mutateAsync(restoreUuid);
      toast.success('User restored');
    } catch {
      toast.error('Failed to restore user');
    }
    setRestoreUuid(null);
  }, [restoreUuid, restoreMutation]);

  const handleDelete = useCallback(async () => {
    if (!deleteUuid) return;
    try {
      await suspendMutation.mutateAsync(deleteUuid);
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
    setDeleteUuid(null);
  }, [deleteUuid, suspendMutation]);

  const columns: ColumnDef<any>[] = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div
            className="flex cursor-pointer items-center gap-2"
            onClick={() => setDetailUuid(row.original.uuid ?? row.original.id)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
              {getInitials(row.original.name ?? row.original.email)}
            </div>
            <span className="font-medium hover:underline">
              {row.original.name ?? row.original.firstName
                ? `${row.original.firstName ?? ''} ${row.original.lastName ?? ''}`.trim()
                : row.original.email}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <Badge variant="outline">
            {row.original.role ?? row.original.userRole ?? 'admin'}
          </Badge>
        ),
      },
      {
        accessorKey: 'company',
        header: 'Company',
        cell: ({ row }) =>
          row.original.company?.name ?? row.original.companyName ?? '-',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const deleted = row.original.deletedAt != null;
          const status = deleted
            ? 'SUSPENDED'
            : (row.original.status ?? 'ACTIVE').toUpperCase();
          return <StatusBadge status={status} />;
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const deleted = row.original.deletedAt != null;
          return (
            <div className="flex items-center gap-1">
              {deleted ? (
                <Button
                  variant="ghost"
                  size="icon"
                  title="Restore"
                  onClick={() => setRestoreUuid(row.original.uuid)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  title="Suspend"
                  onClick={() => setSuspendUuid(row.original.uuid)}
                >
                  <Ban className="h-4 w-4 text-orange-500" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                title="Delete"
                onClick={() => setDeleteUuid(row.original.uuid)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN]}>
    <div className="animate-fade-in">
      <PageHeader
        title="Platform Users"
        description="Manage all users across the platform"
        actions={
          <Button onClick={() => setShowInvite(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Admin
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        pageCount={pageCount}
        pagination={pagination}
        onPaginationChange={setPagination}
        totalRecords={totalRecords}
        emptyTitle="No users found"
        emptyDescription="No users have been registered on the platform yet."
      />

      {/* Invite Admin Dialog */}
      <Dialog open={showInvite} onOpenChange={setShowInvite}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Admin</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Email Address</Label>
              <Input
                type="email"
                placeholder="admin@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInvite(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleInvite}
              disabled={!inviteEmail || inviteMutation.isPending}
            >
              {inviteMutation.isPending ? 'Sending...' : 'Send Invite'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Confirmation */}
      <AlertDialog open={!!suspendUuid} onOpenChange={() => setSuspendUuid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Suspend User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to suspend this user? They will lose access
              to the platform until restored.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSuspend}>
              Suspend
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Restore Confirmation */}
      <AlertDialog open={!!restoreUuid} onOpenChange={() => setRestoreUuid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to restore this user? They will regain access
              to the platform.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>
              Restore
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteUuid} onOpenChange={() => setDeleteUuid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to permanently delete this user? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* User Detail Dialog */}
      <Dialog open={!!detailUuid} onOpenChange={() => setDetailUuid(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
          </DialogHeader>
          {userDetailLoading ? (
            <p className="py-4 text-center text-sm text-muted-foreground">Loading...</p>
          ) : userDetail ? (
            <div className="grid gap-3 py-4">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">Name</span>
                <span className="col-span-2 text-sm">{userDetail.name ?? (`${userDetail.firstName ?? ''} ${userDetail.lastName ?? ''}`.trim() || '-')}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">Email</span>
                <span className="col-span-2 text-sm">{userDetail.email ?? '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">Role</span>
                <span className="col-span-2 text-sm">{userDetail.role ?? userDetail.userRole ?? '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">Company</span>
                <span className="col-span-2 text-sm">{userDetail.company?.name ?? userDetail.companyName ?? '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">Status</span>
                <span className="col-span-2">
                  <StatusBadge status={(userDetail.deletedAt ? 'SUSPENDED' : userDetail.status ?? 'ACTIVE').toUpperCase()} />
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">Phone</span>
                <span className="col-span-2 text-sm">{userDetail.phone ?? userDetail.phoneNumber ?? '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">Created</span>
                <span className="col-span-2 text-sm">{userDetail.createdAt ? new Date(userDetail.createdAt).toLocaleString() : '-'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-sm font-medium text-muted-foreground">Updated</span>
                <span className="col-span-2 text-sm">{userDetail.updatedAt ? new Date(userDetail.updatedAt).toLocaleString() : '-'}</span>
              </div>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-muted-foreground">No user data found.</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </RoleGuard>
  );
}

function getInitials(name: string): string {
  const parts = (name ?? '').trim().split(/\s+/);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase() || '?';
}
