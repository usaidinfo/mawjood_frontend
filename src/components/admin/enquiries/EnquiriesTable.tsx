'use client';

import { useState, useEffect, useRef } from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { Category } from '@/services/category.service';

interface EnquiriesTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onSearchChange: (value: string) => void;
  searchValue?: string;
  loading?: boolean;
  statusFilter?: string;
  categoryFilter?: string;
  categories?: Category[];
  onStatusFilterChange?: (value: string) => void;
  onCategoryFilterChange?: (value: string) => void;
}

export function EnquiriesTable<TData, TValue>({
  columns,
  data,
  onSearchChange,
  searchValue: externalSearchValue = '',
  loading = false,
  statusFilter = 'all',
  categoryFilter = 'all',
  categories = [],
  onStatusFilterChange,
  onCategoryFilterChange,
}: EnquiriesTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [searchValue, setSearchValue] = useState(externalSearchValue);
  const [categorySearch, setCategorySearch] = useState('');
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Filter categories based on search
  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Sync with external search value
  useEffect(() => {
    setSearchValue(externalSearchValue);
  }, [externalSearchValue]);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      onSearchChange(searchValue);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchValue, onSearchChange]);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          {/* Aligned icon standard: left-3, w-4 h-4 */}
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by name, email, phone, message, or business..."
            value={searchValue}
            onChange={(e) => {
              const value = e.target.value;
              setSearchValue(value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            // Standard padding, default height (h-10)
            className="pl-10"
          />
        </div>
        
        {/* Status Filter */}
        {onStatusFilterChange && (
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            {/* Standard height, fixed width */}
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="OPEN">Open</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="CLOSED">Closed</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Category Filter */}
        {onCategoryFilterChange && categories.length > 0 && (
          <Select 
            value={categoryFilter} 
            onValueChange={(value) => {
              onCategoryFilterChange(value);
              setCategorySearch('');
            }}
          >
            {/* Standard height, fixed width */}
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {/* Search Input */}
              <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b p-2">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="pl-8 pr-8 h-8 text-sm"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  {categorySearch && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCategorySearch('');
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* Filtered Categories List */}
              <div className="max-h-[200px] overflow-y-auto">
                <SelectItem value="all">All Categories</SelectItem>
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-6 text-center text-sm text-gray-500">
                    {categorySearch ? `No categories found matching "${categorySearch}"` : 'No categories available'}
                  </div>
                )}
              </div>
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white dark:bg-gray-900">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-semibold text-gray-700 dark:text-gray-300">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              // Skeleton loader
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`} className="border-b">
                  {columns.map((_, colIndex) => (
                    <TableCell key={`skeleton-cell-${colIndex}`} className="py-4">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4">
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
                  className="h-24 text-center text-gray-500"
                >
                  No enquiries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            data.length
          )}{' '}
          of {data.length} enquiries
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="h-8 w-[70px] rounded-md border border-gray-300 bg-transparent px-2 text-sm"
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              ←
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              →
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

