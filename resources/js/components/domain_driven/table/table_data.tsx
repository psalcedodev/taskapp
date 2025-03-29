import { TableBody, TableCell, Table as TableComponent, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, flexRender, getCoreRowModel, getSortedRowModel, Row, useReactTable } from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import * as React from 'react';
import { TableMainHeader } from './table_main_header';

import { ArrowDown, ArrowUp, ArrowUpDownIcon, Loader } from 'lucide-react';

// function debounce(func: Function, wait: number) {
//   let timeout: ReturnType<typeof setTimeout>;
//   return (...args: any) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(...args), wait);
//   };
// }

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export interface Idable {
  id: number;
}

export type CustomColumnDef<T> = ColumnDef<T> & {
  accessorKey: string;
};

export interface DataTableProps<T extends Idable> {
  title: string;
  columns: CustomColumnDef<T>[];
  data: T[];
  isPending: boolean;
  onRowClick: ({ row, index, value }: { row: Row<T>; index: number; value: T }) => void;
  disableSearch?: boolean;
  defaultColumnWidth?: number;
  actionsColumnWidth?: number;
  selectable?: boolean;
  globalActions?: React.ReactNode;
}

export function TableData<T extends Idable>({
  title,
  columns,
  data,
  isPending,
  onRowClick,
  defaultColumnWidth,
  actionsColumnWidth,
  disableSearch = false,
  globalActions,
}: DataTableProps<T>) {
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');
  const [selectedId, setSelectedId] = React.useState<number | null>(null);

  // Update the debounced search term when the user stops typing
  const updateSearchTerm = useDebounce((term: string) => {
    setDebouncedSearchTerm(term);
  }, 200);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    updateSearchTerm(e.target.value);
  };

  function getNestedValue(obj: any, path: string) {
    return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
  }
  const filteredData = React.useMemo(
    () =>
      data.filter((item) => {
        return columns.some((column) => {
          const cellValue = getNestedValue(item, column.accessorKey ?? column.id);
          return cellValue && cellValue.toString().toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        });
      }),
    [data, columns, debouncedSearchTerm],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  const { rows } = table.getRowModel();

  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const mainContainer = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 50,
    getScrollElement: () => tableContainerRef.current,
    overscan: 5, // Load extra rows for smoother scrolling
    measureElement:
      typeof window !== 'undefined' && navigator.userAgent.indexOf('Firefox') === -1
        ? (element) => element?.getBoundingClientRect().height
        : undefined,
  });

  const calculateOverflow = React.useCallback(() => {
    const totalColumnWidth = columns.reduce((total, column) => {
      return total + (column.size || defaultColumnWidth || 150);
    }, 0);

    const containerWidth = tableContainerRef.current ? tableContainerRef.current.offsetWidth : 0;
    setIsOverflowing(totalColumnWidth > containerWidth);
  }, [columns, defaultColumnWidth]);

  React.useEffect(() => {
    calculateOverflow();
    window.addEventListener('resize', calculateOverflow);
    return () => window.removeEventListener('resize', calculateOverflow);
  }, [columns, defaultColumnWidth, calculateOverflow]);

  const virtualizedRows = rowVirtualizer.getVirtualItems();

  return (
    <div className="h-full w-full" ref={mainContainer}>
      <div className="rounded-lg border bg-white">
        <TableMainHeader
          title={title}
          canSearch={!disableSearch}
          searchTerm={searchTerm}
          handleSearchChange={handleSearchChange}
          globalActions={globalActions}
        />
        <div ref={tableContainerRef} className="relative h-[88vh] overflow-auto">
          {isPending ? (
            <div className="flex h-[88vh] w-full items-center justify-center">
              <Loader className="animate-spin" size={32} strokeWidth={1} />
            </div>
          ) : (
            <TableComponent className="grid">
              <TableHeader className="sticky top-0 z-10 grid bg-stone-100">
                {table.getHeaderGroups().map((headerGroup, index) => (
                  <TableRow key={headerGroup.id} className={`sticky top-0 z-10 flex w-full ${index === 0 ? 'pl-2' : ''}`}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        style={{
                          display: 'flex',
                          width: `${header.id === 'actions' ? actionsColumnWidth : (defaultColumnWidth ?? header.getSize())}px`,
                          alignItems: 'center',
                        }}
                        className={`${header.id === 'actions' ? `${isOverflowing ? 'sticky' : 'absolute'} right-0 border-l bg-stone-100` : ''}`}
                      >
                        <div
                          {...{
                            className: header.column.getCanSort() ? 'cursor-pointer select-none flex flex-row items-center' : '',
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.id !== 'actions' && header.column.getCanSort() ? (
                            <>
                              {{
                                asc: <ArrowUp className="ml-2 h-4 w-4" />,
                                desc: <ArrowDown className="ml-2 h-4 w-4" />,
                                false: <ArrowUpDownIcon className="ml-2 h-4 w-4" />,
                              }[header.column.getIsSorted() as string] ?? null}
                            </>
                          ) : null}
                        </div>
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody
                style={{
                  display: 'grid',
                  height: `${rowVirtualizer.getTotalSize()}px`,
                  position: 'relative',
                }}
              >
                {virtualizedRows.map((virtualRow) => {
                  const row = rows[virtualRow.index] as Row<T>;
                  return (
                    <TableRow
                      onClick={() => {
                        setSelectedId(row.original.id);
                        if (selectedId !== row.original.id) {
                          onRowClick({
                            row,
                            index: row.index,
                            value: row.original,
                          });
                        }
                      }}
                      data-index={virtualRow.index}
                      ref={(node) => rowVirtualizer.measureElement(node)}
                      key={row.id}
                      className={`group absolute flex w-full cursor-pointer ${
                        selectedId === row.original.id ? 'bg-gray-100' : 'hover:bg-gray-100'
                      } transition-none`}
                      style={{
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {row.getVisibleCells().map((cell, celindex) => {
                        return (
                          <TableCell
                            key={cell.id}
                            onClick={(e) => {
                              if (cell.column.id === 'actions') e.stopPropagation();
                            }}
                            style={{
                              display: 'flex',

                              width: `${cell.column.id === 'actions' ? actionsColumnWidth : (defaultColumnWidth ?? cell.column.getSize())}px`,
                              position: cell.column.id === 'actions' ? (isOverflowing ? 'sticky' : 'absolute') : 'relative',
                              right: cell.column.id === 'actions' ? 0 : 'auto',
                            }}
                            className={`${cell.column.id === 'actions' ? 'flex h-9 items-center border-l bg-white p-0 px-4' : ''} ${
                              selectedId === row.original.id ? 'bg-gray-100' : 'group-hover:bg-gray-100'
                            } ${celindex === 0 ? 'ml-2' : ''} truncate`}
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  );
                })}
              </TableBody>
            </TableComponent>
          )}
        </div>
      </div>
    </div>
  );
}
