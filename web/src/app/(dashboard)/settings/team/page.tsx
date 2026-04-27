'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Users, Plus, MoreHorizontal } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RoleGuard } from '@/components/role-guard';
import { GlobalRole, MembershipRole } from '@/lib/types/roles';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Form } from '@/components/ui/form';
import { FormInput, FormSelect } from '@/components/forms';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useTeamMembers, useInviteStaff, useUpdateUser } from '@/lib/queries/settings';
import { useRemoveMember, useUpdateMembership } from '@/lib/queries/memberships';
import { inviteMemberSchema, type InviteMemberInput, MEMBER_ROLES } from '@/lib/validators/team';

export default function TeamPage() {
  const { data: members, isLoading } = useTeamMembers();
  const inviteStaff = useInviteStaff();
  const updateUser = useUpdateUser();
  const removeMember = useRemoveMember();
  const updateMembership = useUpdateMembership();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeUuid, setRemoveUuid] = useState<string | null>(null);

  const form = useForm<InviteMemberInput>({
    resolver: zodResolver(inviteMemberSchema),
    defaultValues: { email: '', name: '', role: 'STAFF' },
  });

  const onInvite = async (values: InviteMemberInput) => {
    try {
      await inviteStaff.mutateAsync(values);
      toast.success('Invitation sent');
      setInviteOpen(false);
      form.reset();
    } catch {
      toast.error('Failed to send invitation');
    }
  };

  const handleRoleChange = async (uuid: string, _role?: string) => {
    try {
      await updateMembership.mutateAsync(uuid);
      toast.success('Role updated');
    } catch {
      toast.error('Failed to update role');
    }
  };

  const handleRemove = async () => {
    if (!removeUuid) return;
    try {
      await removeMember.mutateAsync(removeUuid);
      toast.success('Member removed');
    } catch {
      toast.error('Failed to remove member');
    }
    setRemoveUuid(null);
  };

  const handleDeactivate = async (uuid: string) => {
    try {
      await updateUser.mutateAsync({ uuid, body: { isActive: false } });
      toast.success('User deactivated');
    } catch {
      toast.error('Failed to deactivate user');
    }
  };

  const memberList: any[] = Array.isArray(members) ? members : (members as any)?.data ?? [];

  return (
    <RoleGuard roles={[GlobalRole.SUPER_ADMIN, MembershipRole.ADMIN]}>
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Team Members"
        description="Manage team members and invitations"
        actions={
          <Button onClick={() => setInviteOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Invite Member
          </Button>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {memberList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No team members found
                    </TableCell>
                  </TableRow>
                ) : (
                  memberList.map((member: any) => (
                    <TableRow key={member.uuid}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        <Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={member.isActive !== false ? 'default' : 'destructive'}>
                          {member.isActive !== false ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                handleRoleChange(
                                  member.uuid,
                                  member.role === 'ADMIN' ? 'STAFF' : 'ADMIN'
                                )
                              }
                            >
                              Change to {member.role === 'ADMIN' ? 'Staff' : 'Admin'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeactivate(member.uuid)}
                            >
                              Deactivate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setRemoveUuid(member.uuid)}
                            >
                              Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onInvite)} className="space-y-4">
              <FormInput name="name" label="Name" maxLength={255} />
              <FormInput name="email" label="Email" type="email" maxLength={255} />
              <FormSelect
                name="role"
                label="Role"
                options={MEMBER_ROLES.map((r) => ({ value: r, label: r }))}
                description="Staff can create invoices. Admins can manage settings and team members."
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setInviteOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={inviteStaff.isPending}>
                  {inviteStaff.isPending ? 'Sending…' : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog open={!!removeUuid} onOpenChange={() => setRemoveUuid(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member? They will lose access to the organization.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </RoleGuard>
  );
}
