'use client';

import { useState } from 'react';
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  type PaginationState,
  type RowSelectionState,
  type OnChangeFn,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/empty-state';
import { DataTablePagination } from './data-table-pagination';
import { Inbox } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;

  // Server-side pagination
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  totalRecords?: number;

  // Server-side sorting
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;

  // Row selection
  rowSelection?: RowSelectionState;
  onRowSelectionChange?: OnChangeFn<RowSelectionState>;
  enableRowSelection?: boolean;

  // Toolbar slot
  toolbar?: React.ReactNode;

  // Empty state
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  pageCount,
  pagination: controlledPagination,
  onPaginationChange,
  totalRecords,
  sorting: controlledSorting,
  onSortingChange,
  toolbar,
  rowSelection: controlledRowSelection,
  onRowSelectionChange,
  enableRowSelection = false,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: DataTableProps<TData, TValue>) {
  const [internalSorting, setInternalSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [internalPagination, setInternalPagination] = useState<PaginationState>(
    { pageIndex: 0, pageSize: 10 }
  );

  const isServerSide = controlledPagination != null && onPaginationChange != null;

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting: controlledSorting ?? internalSorting,
      columnFilters,
      columnVisibility,
      pagination: controlledPagination ?? internalPagination,
      ...(controlledRowSelection != null ? { rowSelection: controlledRowSelection } : {}),
    },
    ...(pageCount != null && { pageCount, manualPagination: true }),
    ...(onSortingChange
      ? { onSortingChange, manualSorting: true }
      : { onSortingChange: setInternalSorting }),
    ...(onRowSelectionChange && { onRowSelectionChange }),
    enableRowSelection,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: onPaginationChange ?? setInternalPagination,
    getCoreRowModel: getCoreRowModel(),
    ...(!isServerSide && {
      getPaginationRowModel: getPaginationRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
    }),
    ...(!onSortingChange && { getSortedRowModel: getSortedRowModel() }),
  });

  return (
    <div className="space-y-4">
      {toolbar}

      <div className="rounded-md border [&_tr]:h-[52px] [&_tr:nth-child(even)]:bg-[#FAFAFA] [&_tr:hover]:bg-[#F8FAFC]">
        <Table>
          <TableHeader className="bg-muted/50 [&_th]:h-11 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wide [&_th]:text-muted-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: controlledPagination?.pageSize ?? 5 }).map(
                (_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {columns.map((_, j) => (
                      <TableCell key={`skeleton-cell-${i}-${j}`}>
                        <Skeleton className="h-5 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                )
              )
            ) : table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <EmptyState
                    icon={Inbox}
                    title={emptyTitle ?? 'No results found'}
                    description={emptyDescription}
                    className="py-8"
                  />
                  {emptyAction && <div className="flex justify-center mt-2">{emptyAction}</div>}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} totalRecords={totalRecords} />
    </div>
  );
}
