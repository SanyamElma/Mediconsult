import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { FiChevronDown, FiChevronUp, FiChevronLeft, FiChevronRight, FiDownload, FiSearch } from 'react-icons/fi';
import { cn, exportToCsv } from '../../utils';
import { TableSkeleton } from '../ui/Skeleton';
import EmptyState from '../ui/EmptyState';

/**
 * Generic, accessible data table built on TanStack Table.
 * Features: client-side sorting, global search, pagination and CSV export.
 */
export default function DataTable({
  columns,
  data = [],
  loading,
  searchPlaceholder = 'Search…',
  exportName,
  pageSize = 10,
  toolbar,
}) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize } },
  });

  const handleExport = () => {
    const rows = table.getFilteredRowModel().rows.map((r) => r.original);
    exportToCsv(exportName || 'export', rows);
  };

  return (
    <div className="card overflow-hidden p-0">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-slate-200/70 p-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder={searchPlaceholder}
            className="input pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {toolbar}
          {exportName && (
            <button onClick={handleExport} className="btn btn-outline btn-sm whitespace-nowrap text-xs">
              <FiDownload className="h-4 w-4" /> Export CSV
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-4">
            <TableSkeleton rows={pageSize} />
          </div>
        ) : table.getRowModel().rows.length === 0 ? (
          <div className="p-6">
            <EmptyState title="No records found" message="Try adjusting your search or filters." />
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b border-slate-200/70 dark:border-white/10">
                  {hg.headers.map((header) => {
                    const canSort = header.column.getCanSort();
                    return (
                      <th
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className={cn(
                          'whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400',
                          canSort && 'cursor-pointer select-none hover:text-slate-700 dark:hover:text-slate-200',
                        )}
                      >
                        <span className="inline-flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{ asc: <FiChevronUp size={13} />, desc: <FiChevronDown size={13} /> }[header.column.getIsSorted()] ?? null}
                        </span>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b border-slate-100 transition last:border-0 hover:bg-slate-50/80 dark:border-white/5 dark:hover:bg-white/5"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-middle text-slate-700 dark:text-slate-200">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && table.getRowModel().rows.length > 0 && (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200/70 p-4 text-sm dark:border-white/10 sm:flex-row">
          <span className="text-slate-500 dark:text-slate-400">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ·{' '}
            {table.getFilteredRowModel().rows.length} records
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="btn btn-outline btn-sm disabled:opacity-40"
            >
              <FiChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="btn btn-outline btn-sm disabled:opacity-40"
            >
              Next <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
