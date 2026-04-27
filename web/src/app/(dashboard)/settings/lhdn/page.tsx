'use client';

import { useState } from 'react';
import { Shield, RefreshCw, FileText, Bell, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { RoleGuard } from '@/components/role-guard';
import { GlobalRole, MembershipRole } from '@/lib/types/roles';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StatusBadge } from '@/components/status-badge';
import { formatDateTime } from '@/lib/utils';
import {
  useLhdnNotifications,
  useSyncLhdnNotifications,
  useLhdnDocumentTypes,
} from '@/lib/queries/settings';
import {
  useLhdnCredentialStatus,
  useCreateLhdnCredentials,
  useUpdateLhdnCredentials,
  useValidateLhdnCredentials,
  useDeactivateLhdnCredentials,
  useLhdnAuditLog,
} from '@/lib/queries/lhdn';

export default function LhdnPage() {
  const { data: notifications, isLoading: loadingNotifs } = useLhdnNotifications();
  const { data: docTypes, isLoading: loadingDocTypes } = useLhdnDocumentTypes();
  const syncMutation = useSyncLhdnNotifications();

  const { data: credStatus, isLoading: statusLoading } = useLhdnCredentialStatus();
  const createCredentials = useCreateLhdnCredentials();
  const updateCredentials = useUpdateLhdnCredentials();
  const validateMutation = useValidateLhdnCredentials();
  const deactivateMutation = useDeactivateLhdnCredentials();
  const { data: auditLog } = useLhdnAuditLog();

  const [credDialogOpen, setCredDialogOpen] = useState(false);
  const [credForm, setCredForm] = useState({ clientId: '', clientSecret: '', environment: 'sandbox' as 'sandbox' | 'production' });
  const [isEditMode, setIsEditMode] = useState(false);

  const hasCredentials = !!(credStatus as any)?.clientId || (credStatus as any)?.status === 'ACTIVE';

  const handleCredSubmit = async () => {
    try {
      if (isEditMode) {
        await updateCredentials.mutateAsync(credForm);
      } else {
        await createCredentials.mutateAsync(credForm);
      }
      toast.success(isEditMode ? 'Credentials updated' : 'Credentials created');
      setCredDialogOpen(false);
      setCredForm({ clientId: '', clientSecret: '', environment: 'sandbox' });
    } catch {
      toast.error('Failed to save credentials');
    }
  };

  const handleValidate = async () => {
    try {
      await validateMutation.mutateAsync();
      toast.success('Credentials validated successfully');
    } catch {
      toast.error('Credential validation failed');
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateMutation.mutateAsync();
      toast.success('Credentials deactivated');
    } catch {
      toast.error('Failed to deactivate credentials');
    }
  };

  const auditList: any[] = Array.isArray(auditLog) ? auditLog : (auditLog as any)?.data ?? [];

  const handleSync = async () => {
    try {
      await syncMutation.mutateAsync();
      toast.success('LHDN notifications synced');
    } catch {
      toast.error('Failed to sync notifications');
    }
  };

  const notifList: any[] = Array.isArray(notifications) ? notifications : (notifications as any)?.data ?? [];
  const docTypeList: any[] = Array.isArray(docTypes) ? docTypes : (docTypes as any)?.data ?? [];

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN, MembershipRole.ADMIN]}>
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="LHDN Integration"
        description="Manage LHDN e-Invoice integration and notifications"
        actions={
          <Button onClick={handleSync} disabled={syncMutation.isPending}>
            <RefreshCw className={`mr-2 h-4 w-4 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
            Sync Notifications
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Credential Status
          </CardTitle>
          <CardDescription>LHDN API connection status</CardDescription>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <Skeleton className="h-8 w-48" />
          ) : (
            <div className="flex items-center gap-4">
              <StatusBadge status={(credStatus as any)?.status ?? 'INACTIVE'} />
              <span className="text-sm text-muted-foreground">
                {(credStatus as any)?.environment === 'production' ? 'Production' : 'Sandbox'} environment
              </span>
              <div className="ml-auto flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsEditMode(hasCredentials);
                    setCredDialogOpen(true);
                  }}
                >
                  {hasCredentials ? 'Edit' : 'Setup'} Credentials
                </Button>
                {hasCredentials && (
                  <>
                    <Button variant="outline" size="sm" onClick={handleValidate} disabled={validateMutation.isPending}>
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Validate
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleDeactivate} disabled={deactivateMutation.isPending} className="text-destructive">
                      <XCircle className="mr-1 h-3 w-3" />
                      Deactivate
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Types
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingDocTypes ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : docTypeList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No document types available
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {docTypeList.map((dt: any, idx: number) => (
                <Badge key={idx} variant="outline" className="text-sm">
                  {dt.description || dt.code || dt.name || JSON.stringify(dt)}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingNotifs ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : notifList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No notifications yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifList.map((n: any, idx: number) => (
                  <TableRow key={n.uuid ?? idx}>
                    <TableCell>
                      <Badge variant="outline">{n.type ?? n.notificationType ?? '-'}</Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {n.message ?? n.subject ?? '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={n.status === 'read' ? 'secondary' : 'default'}>
                        {n.status ?? 'new'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDateTime(n.createdAt ?? n.receivedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {/* Audit Log */}
      <Card>
        <CardHeader>
          <CardTitle>Audit Log</CardTitle>
        </CardHeader>
        <CardContent>
          {auditList.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No audit entries</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditList.map((entry: any, idx: number) => (
                  <TableRow key={entry.uuid ?? idx}>
                    <TableCell className="font-medium">{entry.action ?? '-'}</TableCell>
                    <TableCell>{entry.user?.name ?? entry.userName ?? '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">{entry.details ?? '-'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(entry.createdAt ?? entry.timestamp)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Credential Form Dialog */}
      <Dialog open={credDialogOpen} onOpenChange={setCredDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit' : 'Create'} LHDN Credentials</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Client ID *</Label>
              <Input value={credForm.clientId} onChange={(e) => setCredForm({ ...credForm, clientId: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Client Secret *</Label>
              <Input type="password" value={credForm.clientSecret} onChange={(e) => setCredForm({ ...credForm, clientSecret: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Environment</Label>
              <Select value={credForm.environment} onValueChange={(v) => setCredForm({ ...credForm, environment: v as 'sandbox' | 'production' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sandbox">Sandbox</SelectItem>
                  <SelectItem value="production">Production</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCredDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCredSubmit} disabled={!credForm.clientId || !credForm.clientSecret || createCredentials.isPending || updateCredentials.isPending}>
              {isEditMode ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
    </RoleGuard>
  );
}
