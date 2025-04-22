import { IconButton } from '@/components/ui/icon-button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableHeader, TableRow } from '@/components/ui/table';
import { AsyncActionRunner } from '@/hex/async_action_runner';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAsyncStatus } from '@/hooks/use_async_status';
import { useAsyncValue } from '@/hooks/use_async_value';
import { cn } from '@/lib/utils';
import debounce from 'lodash.debounce';
import { Loader2, SearchIcon } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  const isMobile = useIsMobile();
  const [domain] = useState(() => {
    const domain = new TableDomain(initialColumns, dataRunner);
    return domain;
  });
  const columns = useAsyncValue(domain.columns);
  const ghostRef = useRef<HTMLDivElement>(null);
  const filter = useAsyncValue(domain.filter);
  const sortConfig = useAsyncValue(domain.sortConfig);
  const [debouncedFilter, setDebouncedFilter] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchButtonRef = useRef<HTMLButtonElement>(null);

  const totalMinWidth = columns.reduce((acc, col) => acc + (col.size || 150), 0) + actionsColumnWidth;
  const debouncedSetFilter = useCallback(
    debounce((value: string) => setDebouncedFilter(value), 300),
    [],
  );
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

  useEffect(() => {
    if (isSearchVisible) {
      searchInputRef.current?.focus();
    }
  }, [isSearchVisible]);

  const toggleSearchVisibility = useCallback(() => {
    setIsSearchVisible((prev) => {
      const nextVisible = !prev;
      if (!nextVisible) {
        // Optionally clear filter
        // domain.setFilter('');
        // debouncedSetFilter('');
      }
      return nextVisible;
    });
  }, []); // Add domain/debouncedSetFilter if clearing filter

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchVisible &&
        // Check click outside input itself
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node) &&
        // Check click outside search button
        searchButtonRef.current &&
        !searchButtonRef.current.contains(event.target as Node) &&
        !filter // Check if filter is empty
      ) {
        toggleSearchVisibility();
      }
    };

    if (isSearchVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchVisible, filter, toggleSearchVisibility]);

  return (
    <div className="relative flex h-full flex-grow flex-col overflow-auto rounded-md border">
      <div className="flex items-center justify-between gap-4 p-2">
        {!isMobile && <h2 className="text-foreground shrink-0 text-xl font-semibold">{title}</h2>}
        <div className={cn('flex min-w-0 flex-grow items-center justify-end gap-2')}>
          <div className="relative flex items-center">
            <IconButton
              ref={searchButtonRef}
              Icon={SearchIcon}
              onClick={toggleSearchVisibility}
              size="sm"
              className="bg-background relative z-10 mr-2 shrink-0"
            />
            <Input
              ref={searchInputRef}
              placeholder="Search..."
              value={filter}
              onChange={handleFilterChange}
              className={cn(
                'bg-background absolute top-1/2 right-0 h-8 -translate-y-1/2 overflow-hidden rounded-md border pr-3 pl-3 text-sm transition-[width,opacity] duration-300 ease-in-out focus:shadow-none focus:ring-0',
                isSearchVisible ? 'w-40 opacity-100 md:w-72' : 'pointer-events-none w-0 opacity-0',
              )}
            />
          </div>
          {/* add divider */}
          <div className="bg-border h-4 w-px" />
          <div className="shrink-0">{endAdornments}</div>
        </div>
      </div>
      {/* Render Ghost Resizer here, relative to the main container */}
      <div
        ref={ghostRef}
        className="pointer-events-none absolute z-50 h-10 w-0.5 border opacity-70"
        style={{
          display: 'none',
          cursor: 'col-resize',
        }}
      />
      {/* Table Area */}
      <div className="relative flex-grow">
        {isPending ? (
          <div className="absolute inset-0 flex h-full w-full items-center justify-center">
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
              TableRow: (props) => (
                <TableRow {...props} className={`group hover:bg-muted/50 flex w-full cursor-pointer`} onClick={() => onRowClick(props.item)} />
              ),
              TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
            }}
          />
        )}
      </div>
    </div>
  );
};
