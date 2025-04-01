import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AsyncActionRunner } from '@/hex/async_action_runner';
import { useAsyncStatus } from '@/hooks/use_async_status';
import { useAsyncValue } from '@/hooks/use_async_value';
import debounce from 'lodash.debounce';
import { ArrowDownAZIcon, ArrowDownUpIcon, ArrowDownZA, Loader2 } from 'lucide-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { TableVirtuoso } from 'react-virtuoso';
import { Idable } from './table_types';

export interface ColumnDef<T extends Idable> {
  id: string;
  accessorKey: keyof T;
  header: string;
  cell: (row: T, index: number) => React.ReactNode;
  size?: number;
  sortable?: boolean;
}

interface Props<T extends Idable> {
  title: string;
  endAdornments?: React.ReactNode;
  columns: ColumnDef<T>[];
  dataRunner: AsyncActionRunner<T[]>;
  actionsColumnWidth?: number;
  actionsCell?: (row: T, index: number) => React.ReactNode;
}

export const VirtualizedResizableTable = <T extends Idable>({
  title,
  endAdornments,
  columns: initialColumns,
  dataRunner,
  actionsColumnWidth = 120,
  actionsCell,
}: Props<T>) => {
  const [columns, setColumns] = useState(initialColumns);
  const totalMinWidth = columns.reduce((acc, col) => acc + (col.size || 150), 0) + actionsColumnWidth;
  const [filter, setFilter] = useState('');
  const [debouncedFilter, setDebouncedFilter] = useState('');
  const [selectedRowId, setSelectedRowId] = useState<number | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' | null } | null>(null);

  const debouncedSetFilter = useCallback(
    debounce((value: string) => {
      setDebouncedFilter(value);
    }, 300),
    [],
  );

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    debouncedSetFilter(e.target.value);
  };

  const toggleSort = (key: keyof T) => {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, direction: 'asc' };
      if (prev.direction === 'asc') return { key, direction: 'desc' };
      return null;
    });
  };

  const handleResize = (key: keyof T, newSize: number) => {
    // Delay resizing until mouseup
    setTimeout(() => {
      setColumns((prevCols) => prevCols.map((col) => (col.accessorKey === key ? { ...col, size: newSize } : col)));
    }, 0);
  };

  const tableData = useAsyncValue(dataRunner);
  const { isPending } = useAsyncStatus(dataRunner);

  const filteredData = useMemo(() => {
    let temp = [...tableData];

    if (debouncedFilter) {
      const lowercasedFilter = debouncedFilter.toLowerCase();
      temp = temp.filter((item) =>
        columns.some((col) => {
          const cellValue = item[col.accessorKey];
          return cellValue?.toString().toLowerCase().includes(lowercasedFilter);
        }),
      );
    }

    if (sortConfig) {
      temp.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal === undefined || bVal === undefined || bVal === null || aVal === null) return 0;
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return temp;
  }, [debouncedFilter, tableData, columns, sortConfig]);

  return (
    <div className="relative flex-grow overflow-auto rounded-md border">
      <div className="flex items-center justify-between p-2">
        <h2 className="text-foreground text-xl font-semibold">{title}</h2>
        <div className="flex items-center gap-2">
          <Input placeholder="Search..." value={filter} onChange={handleFilterChange} className="w-full max-w-md" />
          {endAdornments}
        </div>
      </div>
      {isPending ? (
        <div className="flex h-full w-full items-center justify-center">
          <Loader2 className="animate-spin" size={32} strokeWidth={1} />
        </div>
      ) : (
        <TableVirtuoso
          className="w-full border-t"
          style={{ height: 'calc(100% - 53px)' }}
          data={filteredData}
          fixedHeaderContent={() => (
            <TableHeaderComponent
              columns={columns}
              actionsCell={Boolean(actionsCell)}
              actionsColumnWidth={actionsColumnWidth}
              onSort={toggleSort}
              currentSort={sortConfig}
              onResize={handleResize}
            />
          )}
          itemContent={(rowIndex, row) => (
            <TableRowComponent
              rowIndex={rowIndex}
              columns={columns}
              row={row}
              actionsCell={actionsCell}
              actionsColumnWidth={actionsColumnWidth}
              isLastRow={rowIndex === tableData.length - 1}
              isSelected={selectedRowId === row.id}
            />
          )}
          components={{
            Table: (props) => <Table {...props} style={{ width: '100%', minWidth: totalMinWidth }} />,
            TableHead: React.forwardRef((props, ref) => <TableHeader {...props} ref={ref} className="bg-background sticky top-0 z-10" />),
            TableRow: (props) => <TableRow onClick={() => setSelectedRowId(props.item.id)} {...props} className={`group flex w-full`} />,
            TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
          }}
        />
      )}
    </div>
  );
};

export interface TableHeaderComponentProps<T extends Idable> {
  columns: ColumnDef<T>[];
  actionsCell?: boolean;
  actionsColumnWidth?: number;
  onSort?: (key: keyof T) => void;
  currentSort?: { key: keyof T; direction: 'asc' | 'desc' | null } | null;
  onResize?: (key: keyof T, newSize: number) => void;
}

export const TableHeaderComponent = <T extends Idable>({
  columns,
  actionsCell,
  actionsColumnWidth = 120,
  onSort,
  currentSort,
  onResize,
}: TableHeaderComponentProps<T>) => {
  const startXRef = useRef<number | null>(null);
  const startWidthRef = useRef<number | null>(null);
  const resizingKeyRef = useRef<keyof T | null>(null);

  const handleMouseMove = (e: MouseEvent) => {
    if (startXRef.current !== null && startWidthRef.current !== null && resizingKeyRef.current && onResize) {
      const delta = e.clientX - startXRef.current;
      const newSize = Math.max(50, startWidthRef.current + delta);
      onResize(resizingKeyRef.current, newSize);
    }
  };

  const handleMouseUp = () => {
    startXRef.current = null;
    startWidthRef.current = null;
    resizingKeyRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  const startResizing = (e: React.MouseEvent, key: keyof T, currentSize: number) => {
    e.stopPropagation();
    startXRef.current = e.clientX;
    startWidthRef.current = currentSize;
    resizingKeyRef.current = key;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  return (
    <TableRow className="flex w-full border-b">
      {columns.map((col) => {
        const isSorted = currentSort?.key === col.accessorKey;
        const direction = currentSort?.direction;
        const showSort = col.sortable && onSort;
        const width = col.size || 150;

        return (
          <TableHead
            key={col.id}
            onClick={() => showSort && onSort(col.accessorKey)}
            style={{ flex: `0 0 ${width}px`, cursor: showSort ? 'pointer' : 'default', position: 'relative' }}
            className="bg-background flex items-center gap-1 border-r p-2"
          >
            <div className="flex items-center gap-1">
              {col.header}
              {showSort && (
                <span>
                  {isSorted ? (
                    direction === 'asc' ? (
                      <ArrowDownAZIcon className="h-4 w-4" />
                    ) : direction === 'desc' ? (
                      <ArrowDownZA className="h-4 w-4" />
                    ) : null
                  ) : (
                    <ArrowDownUpIcon className="h-4 w-4" />
                  )}
                </span>
              )}
            </div>
            {onResize && (
              <div onMouseDown={(e) => startResizing(e, col.accessorKey, width)} className="absolute top-0 right-0 h-full w-1 cursor-col-resize" />
            )}
          </TableHead>
        );
      })}
      <TableHead className="bg-background flex-[1_1_auto]" />
      {actionsCell && (
        <TableHead style={{ flex: `0 0 ${actionsColumnWidth}px` }} className="bg-background sticky right-0 z-10 flex items-center border-l">
          Actions
        </TableHead>
      )}
    </TableRow>
  );
};

type TableRowComponentProps<T extends Idable> = {
  rowIndex: number;
  columns: ColumnDef<T>[];
  actionsCell?: (row: T, index: number) => React.ReactNode;
  actionsColumnWidth: number;
  row: T;
  isLastRow: boolean;
  isSelected: boolean;
};

export const TableRowComponent = <T extends Idable>({
  rowIndex,
  columns,
  actionsCell,
  actionsColumnWidth,
  row,
  isLastRow,
  isSelected,
}: TableRowComponentProps<T>) => {
  return (
    <>
      {columns.map((col) => (
        <TableCell
          key={col.id}
          style={{
            flex: `0 0 ${col.size || 150}px`,
          }}
          className={`group-hover:bg-muted overflow-hidden border-r p-2 text-ellipsis whitespace-nowrap ${isLastRow ? 'border-b-0' : 'border-b'} ${isSelected ? 'bg-muted' : ''}`}
        >
          {col.cell(row, rowIndex)}
        </TableCell>
      ))}
      <TableCell
        className={`bg-background group-hover:bg-muted flex-[1_1_auto] ${isLastRow ? 'border-b-0' : 'border-b'} ${isSelected ? 'bg-muted' : ''}`}
      />
      {actionsCell && (
        <TableCell
          style={{
            flex: `0 0 ${actionsColumnWidth}px`,
          }}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className={`bg-background group-hover:bg-muted sticky right-0 border-l p-2 ${isLastRow ? 'border-b-0' : 'border-b'} ${isSelected ? 'bg-muted' : ''}`}
        >
          {actionsCell(row, rowIndex)}
        </TableCell>
      )}
    </>
  );
};
