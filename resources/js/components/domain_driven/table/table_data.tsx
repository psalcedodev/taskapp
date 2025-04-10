import { Input } from '@/components/ui/input';
import { Table, TableBody, TableHeader, TableRow } from '@/components/ui/table';
import { AsyncActionRunner } from '@/hex/async_action_runner';
import { useAsyncStatus } from '@/hooks/use_async_status';
import { useAsyncValue } from '@/hooks/use_async_value';
import debounce from 'lodash.debounce';
import { Loader2 } from 'lucide-react';
import React, { useMemo, useRef, useState } from 'react';
import { TableVirtuoso } from 'react-virtuoso';
import { TableDomain } from './table_domain';
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
  selectedRowId: number | null;
  actionsColumnWidth?: number;
  actionsCell?: (row: T, index: number) => React.ReactNode;
  onRowClick: (row: T) => void;
}

export const VirtualizedResizableTable = <T extends Idable>({
  title,
  endAdornments,
  columns: initialColumns,
  dataRunner,
  actionsColumnWidth = 120,
  selectedRowId,
  actionsCell,
  onRowClick,
}: Props<T>) => {
  const [domain] = useState(() => {
    const domain = new TableDomain(initialColumns, dataRunner);
    return domain;
  });
  const columns = useAsyncValue(domain.columns);
  const ghostRef = useRef<HTMLDivElement>(null);
  const filter = useAsyncValue(domain.filter);
  const sortConfig = useAsyncValue(domain.sortConfig);
  const [debouncedFilter, setDebouncedFilter] = useState('');

  const totalMinWidth = columns.reduce((acc, col) => acc + (col.size || 150), 0) + actionsColumnWidth;
  const debouncedSetFilter = useMemo(() => debounce((value: string) => setDebouncedFilter(value), 300), [setDebouncedFilter]);
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    domain.setFilter(e.target.value);
    debouncedSetFilter(e.target.value);
  };

  const tableData = useAsyncValue(domain.dataRunner);
  const { isPending } = useAsyncStatus(domain.dataRunner);

  const filteredData = useMemo(() => {
    let temp = [...tableData];
    if (debouncedFilter) {
      const filterText = debouncedFilter.toLowerCase();
      temp = temp.filter((item) => columns.some((col) => item[col.accessorKey]?.toString().toLowerCase().includes(filterText)));
    }
    if (sortConfig) {
      temp.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (aVal == null || bVal == null) return 0;
        return sortConfig.direction === 'asc' ? (aVal < bVal ? -1 : 1) : aVal > bVal ? -1 : 1;
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
      <div
        ref={ghostRef}
        className="pointer-events-none absolute z-50 h-10 w-0.5 border opacity-70"
        style={{
          display: 'none',
        }}
      />
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
              actionsColumnWidth={actionsColumnWidth}
              onSort={(key) => domain.toggleSort(key)}
              currentSort={sortConfig}
              ghostRef={ghostRef}
              setColumns={(cols) => domain.setColumns(cols)}
              actionsCell={Boolean(actionsCell)}
            />
          )}
          itemContent={(rowIndex, row) => (
            <TableRowComponent
              rowIndex={rowIndex}
              columns={columns}
              actionsCell={actionsCell}
              actionsColumnWidth={actionsColumnWidth}
              row={row}
              isSelected={selectedRowId === row.id}
            />
          )}
          components={{
            Table: (props) => <Table {...props} style={{ width: '100%', minWidth: totalMinWidth }} />,
            TableHead: React.forwardRef((props, ref) => <TableHeader {...props} ref={ref} className="bg-background sticky top-0 z-10" />),
            TableRow: (props) => <TableRow {...props} className={`group flex w-full`} onClick={() => onRowClick(props.item)} />,
            TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
          }}
        />
      )}
    </div>
  );
};
