'use client';

import { type ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import {
  MoreHorizontal,
  Eye,
  Pencil,
  CheckCircle,
  Send,
  Copy,
  XCircle,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { StatusBadge } from '@/components/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DataTableColumnHeader } from '@/components/data-table';
import { formatCurrency, formatDate } from '@/lib/utils';

export const statusStyles: Record<string, string> = {
  DRAFT: 'bg-zinc-100 text-zinc-700',
  FINALIZED: 'bg-blue-100 text-blue-700',
  SENT: 'bg-amber-100 text-amber-700',
  PAID: 'bg-green-100 text-green-700',
  OVERDUE: 'bg-red-100 text-red-700',
  VOIDED: 'bg-zinc-100 text-zinc-500',
  CANCELLED: 'bg-zinc-100 text-zinc-500',
  SUBMITTED: 'bg-blue-100 text-blue-700',
  VALIDATED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  COMPLETED: 'bg-green-100 text-green-700',
};

interface InvoiceActionsProps {
  uuid: string;
  status: string;
  onFinalize: (uuid: string) => void;
  onSendEmail: (uuid: string) => void;
  onDuplicate: (uuid: string) => void;
  onVoid: (uuid: string) => void;
  onDelete: (uuid: string) => void;
}

function InvoiceActions({
  uuid,
  status,
  onFinalize,
  onSendEmail,
  onDuplicate,
  onVoid,
  onDelete,
}: InvoiceActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/invoices/${uuid}`}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </DropdownMenuItem>
        {status === 'DRAFT' && (
          <DropdownMenuItem asChild>
            <Link href={`/invoices/${uuid}`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        {status === 'DRAFT' && (
          <DropdownMenuItem onClick={() => onFinalize(uuid)}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Finalize
          </DropdownMenuItem>
        )}
        {['FINALIZED', 'SENT'].includes(status) && (
          <DropdownMenuItem onClick={() => onSendEmail(uuid)}>
            <Send className="mr-2 h-4 w-4" />
            Send Email
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => onDuplicate(uuid)}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {!['VOIDED', 'CANCELLED'].includes(status) && (
          <DropdownMenuItem
            onClick={() => onVoid(uuid)}
            className="text-red-600"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Void
          </DropdownMenuItem>
        )}
        {status === 'DRAFT' && (
          <DropdownMenuItem
            onClick={() => onDelete(uuid)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function getInvoiceColumns(actions: {
  onFinalize: (uuid: string) => void;
  onSendEmail: (uuid: string) => void;
  onDuplicate: (uuid: string) => void;
  onVoid: (uuid: string) => void;
  onDelete: (uuid: string) => void;
}): ColumnDef<any, any>[] {
  return [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'invoiceNo',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Invoice #" />
      ),
      cell: ({ row }) => {
        const uuid = row.original.uuid;
        const invoiceNo = row.getValue('invoiceNo') as string;
        return (
          <Link
            href={`/invoices/${uuid}`}
            className="font-medium text-primary hover:underline"
          >
            {invoiceNo || '-'}
          </Link>
        );
      },
    },
    {
      accessorKey: 'customer',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => {
        const customer = row.original.customer;
        return customer?.name ?? customer ?? '-';
      },
    },
    {
      accessorKey: 'invoiceDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => formatDate(row.getValue('invoiceDate')),
    },
    {
      accessorKey: 'dueDate',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Date" />
      ),
      cell: ({ row }) => formatDate(row.getValue('dueDate')),
    },
    {
      accessorKey: 'totalAmount',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Amount" className="text-right" />
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.getValue('totalAmount'))}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = (row.getValue('status') as string) ?? 'DRAFT';
        return <StatusBadge status={status.toUpperCase()} />;
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const invoice = row.original;
        return (
          <InvoiceActions
            uuid={invoice.uuid}
            status={(invoice.status ?? 'DRAFT').toUpperCase()}
            {...actions}
          />
        );
      },
    },
  ];
}
