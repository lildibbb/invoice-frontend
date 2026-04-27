import { cn } from '@/lib/utils';

const statusStyles: Record<string, string> = {
  // Invoice statuses
  DRAFT: 'bg-[#F1F5F9] text-[#475569]',
  SENT: 'bg-[#EFF6FF] text-[#1D4ED8]',
  PAID: 'bg-[#ECFDF5] text-[#065F46]',
  OVERDUE: 'bg-[#FEF2F2] text-[#991B1B]',
  VOIDED: 'bg-[#F1F5F9] text-[#64748B]',
  CANCELLED: 'bg-[#F1F5F9] text-[#64748B]',
  PENDING_APPROVAL: 'bg-[#FFFBEB] text-[#92400E]',
  PENDING: 'bg-[#FFFBEB] text-[#92400E]',
  FINALIZED: 'bg-[#EFF6FF] text-[#1D4ED8]',
  
  // LHDN statuses
  LHDN_SUBMITTED: 'bg-[#EDE9FE] text-[#5B21B6]',
  LHDN_VALID: 'bg-[#ECFDF5] text-[#065F46]',
  LHDN_INVALID: 'bg-[#FEF2F2] text-[#991B1B]',
  LHDN_CANCELLED: 'bg-[#F1F5F9] text-[#374151]',
  SUBMITTED: 'bg-[#EDE9FE] text-[#5B21B6]',
  VALID: 'bg-[#ECFDF5] text-[#065F46]',
  INVALID: 'bg-[#FEF2F2] text-[#991B1B]',
  
  // General statuses
  ACTIVE: 'bg-[#ECFDF5] text-[#065F46]',
  INACTIVE: 'bg-[#F1F5F9] text-[#64748B]',
  SUSPENDED: 'bg-[#FEF2F2] text-[#991B1B]',
  APPROVED: 'bg-[#ECFDF5] text-[#065F46]',
  REJECTED: 'bg-[#FEF2F2] text-[#991B1B]',
  EXPIRED: 'bg-[#F1F5F9] text-[#64748B]',
  
  // Payment
  PARTIAL: 'bg-[#FFFBEB] text-[#92400E]',
  COMPLETED: 'bg-[#ECFDF5] text-[#065F46]',
  FAILED: 'bg-[#FEF2F2] text-[#991B1B]',
  REFUNDED: 'bg-[#F1F5F9] text-[#64748B]',
  
  // Recurring
  PAUSED: 'bg-[#FFFBEB] text-[#92400E]',
  
  // Quotation
  ACCEPTED: 'bg-[#ECFDF5] text-[#065F46]',
  CONVERTED: 'bg-[#EFF6FF] text-[#1D4ED8]',
  REVISED: 'bg-[#FFFBEB] text-[#92400E]',
};

function formatLabel(status: string): string {
  return status
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/Lhdn/g, 'LHDN');
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = statusStyles[status] || 'bg-[#F1F5F9] text-[#475569]';
  return (
    <span className={cn(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
      style,
      className
    )}>
      {formatLabel(status)}
    </span>
  );
}
