import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Cell,
  ColumnDef,
  ColumnPinningState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  Header,
  useReactTable,
} from '@tanstack/react-table'; // Import ColumnPinningState
import { useVirtualizer } from '@tanstack/react-virtual';
import React from 'react';

import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  defaultColumnWidth?: number;
  actionsColumnWidth?: number;
}

export function DataTable<TData, TValue>({ columns, data, isLoading, defaultColumnWidth = 150 }: DataTableProps<TData, TValue>) {
  const [isOverflowing, setIsOverflowing] = React.useState(false);

  const [globalFilter, setGlobalFilter] = React.useState<string>('');
  const [columnPinning, setColumnPinning] = React.useState<ColumnPinningState>({
    right: ['actions'],
  });

  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      columnPinning,
    },
    onColumnPinningChange: setColumnPinning,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    getFilteredRowModel: getFilteredRowModel(),
  });

  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: () => 35,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  const totalColumnWidth = React.useMemo(() => {
    const headers = table.getFlatHeaders();
    return headers.reduce((sum, header) => sum + header.getSize(), 0);
  }, [table.getFlatHeaders()]); // Recalculate if headers change

  console.log('Total Column Width:', totalColumnWidth);
  const calculateOverflow = React.useCallback(() => {
    if (tableContainerRef.current) {
      const containerWidth = tableContainerRef.current.offsetWidth;
      console.log('Container Width:', containerWidth, 'Total Column Width:', totalColumnWidth);
      setIsOverflowing(totalColumnWidth > containerWidth);
    } else {
      setIsOverflowing(false);
    }
  }, [totalColumnWidth]); // Depend on calculated totalColumnWidth

  React.useEffect(() => {
    // Run on mount and when totalColumnWidth changes
    calculateOverflow();
    // Also run on resize
    window.addEventListener('resize', calculateOverflow);
    return () => window.removeEventListener('resize', calculateOverflow);
  }, [calculateOverflow]); // Effect depends on the memoized callback

  return (
    <div className="flex h-full w-[1000px] flex-col">
      <div className="flex-shrink-0 py-4">
        <Input placeholder="Search" value={globalFilter ?? ''} onChange={(event) => setGlobalFilter(event.target.value)} className="max-w-sm" />
      </div>
      <div ref={tableContainerRef} className="h-[600px] w-full flex-grow overflow-auto rounded-md border">
        {isLoading ? (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="animate-spin" size={32} strokeWidth={1} />
          </div>
        ) : (
          <Table className="relative w-full" style={{ minWidth: totalColumnWidth }}>
            <TableHeader className="bg-background sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup, index) => (
                // Header Row: Use Flex
                <TableRow key={headerGroup.id} className={`flex w-full ${index === 0 ? 'pl-2' : ''}`}>
                  {headerGroup.headers.map((header: Header<TData, unknown>) => {
                    // Add explicit type
                    // Determine if this is the Actions column
                    const isActionsColumn = header.id === 'actions';
                    // Apply sticky/absolute based on overflow state only for Actions column
                    const positionStyle = isActionsColumn ? (isOverflowing ? 'sticky' : 'absolute') : undefined;

                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        style={{
                          display: 'flex',
                          width: `${header.getSize()}px`,
                          alignItems: 'center',
                          position: positionStyle,
                          right: isActionsColumn ? 0 : undefined,
                          zIndex: isActionsColumn ? 2 : undefined,
                        }}
                        className={`${isActionsColumn ? 'bg-background border-l' : ''} group-hover:bg-muted/50`}
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody
              style={{
                display: 'block',
                position: 'relative',
                height: `${totalSize}px`,
              }}
            >
              {virtualRows.map((virtualRow) => {
                const row = rows[virtualRow.index];
                return (
                  <TableRow
                    onClick={() => {
                      setSelectedId(row.id);
                    }}
                    data-index={virtualRow.index}
                    ref={(node) => rowVirtualizer.measureElement(node)}
                    key={row.id}
                    className={`group absolute flex w-full cursor-pointer ${selectedId === row.id ? 'bg-muted/50' : 'hover:bg-muted/50'} transition-none`}
                    style={{ transform: `translateY(${virtualRow.start}px)` }}
                  >
                    {row.getVisibleCells().map((cell: Cell<TData, unknown>, celindex) => {
                      // Add explicit type
                      // Determine if this is the Actions column
                      const isActionsColumn = cell.column.id === 'actions';
                      // Apply sticky/absolute based on overflow state only for Actions column
                      const positionStyle = isActionsColumn ? (isOverflowing ? 'sticky' : 'absolute') : 'relative'; // Default cells are relative

                      return (
                        <TableCell
                          key={cell.id}
                          onClick={(e) => {
                            if (isActionsColumn) e.stopPropagation();
                          }}
                          style={{
                            display: 'flex',
                            width: `${cell.column.getSize()}px`, // Use calculated size
                            // Manual Pinning Styles for Actions column
                            position: positionStyle,
                            right: isActionsColumn ? 0 : undefined,
                            zIndex: isActionsColumn ? 2 : undefined, // Actions cell above others
                          }}
                          // Conditional background/border/padding for Actions column
                          // Ensure height matches row, align items center
                          className={`${isActionsColumn ? 'flex h-full items-center border-l bg-white p-0 px-4' : ''} ${selectedId === row.id ? 'bg-muted/50' : 'group-hover:bg-muted/50'} ${celindex === 0 ? 'ml-2' : ''} truncate`}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
              {!rows.length && (
                <TableRow
                  style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '150px',
                  }}
                >
                  <TableCell colSpan={columns.length} className="text-muted-foreground py-10 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
