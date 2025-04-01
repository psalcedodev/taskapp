import { Input } from '@/components/ui/input';
import { Table, TableBody, TableHeader, TableRow } from '@/components/ui/table';
import { AsyncActionRunner } from '@/hex/async_action_runner';
import { useAsyncStatus } from '@/hooks/use_async_status';
import { useAsyncValue } from '@/hooks/use_async_value';
import debounce from 'lodash.debounce';
import { Loader2 } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { TableVirtuoso } from 'react-virtuoso';
import { TableHeaderComponent } from './table_header_component';
import { TableRowComponent } from './table_row_component';
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
    setColumns((prevCols) => prevCols.map((col) => (col.accessorKey === key ? { ...col, size: newSize } : col)));
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
