import { z } from 'zod';

export const MEMBER_ROLES = ['ADMIN', 'STAFF'] as const;

export const inviteMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().min(1, 'Email is required').email('Invalid email').max(255),
  role: z.enum(MEMBER_ROLES, { required_error: 'Role is required' }),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
