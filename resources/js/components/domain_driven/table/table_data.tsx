import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React from 'react';
import { TableVirtuoso } from 'react-virtuoso';

export interface ColumnDef<T> {
  id: string;
  accessorKey: keyof T;
  header: React.ReactNode | ((col: ColumnDef<T>) => React.ReactNode);
  cell: (row: T, index: number) => React.ReactNode;
  size?: number;
}

interface Props<T> {
  columns: ColumnDef<T>[];
  data: T[];
  actionsColumnWidth?: number;
  actionsCell?: (row: T, index: number) => React.ReactNode;
}

// interface Props {
//   columns: Column[];
//   data: Record<string, any>[];
//   actionsColumnWidth?: number;
// }
export const VirtualizedResizableTable = <T extends Record<string, any>>({ columns, data, actionsColumnWidth = 120, actionsCell }: Props<T>) => {
  const totalMinWidth = columns.reduce((acc, col) => acc + (col.size || 150), 0) + actionsColumnWidth;

  return (
    <div className="relative flex-grow overflow-auto rounded-md border">
      <TableVirtuoso
        style={{ height: '100%', width: '100%' }}
        data={data}
        fixedHeaderContent={() => (
          <TableRow style={{ display: 'flex', width: '100%' }}>
            {columns.map((col) => (
              <TableHead
                key={col.id}
                style={{
                  flex: `0 0 ${col.size || 150}px`,
                  padding: '8px',
                  borderRight: '1px solid #e5e7eb',
                  background: 'white',
                  textAlign: 'left',
                }}
              >
                {typeof col.header === 'function' ? col.header(col) : col.header}
              </TableHead>
            ))}
            <TableHead style={{ flex: '1 1 auto', background: 'white', borderRight: '1px solid #e5e7eb' }} />
            <TableHead
              style={{
                flex: `0 0 ${actionsColumnWidth}px`,
                position: 'sticky',
                right: 0,
                background: 'white',
                borderLeft: '1px solid #e5e7eb',
                textAlign: 'left',
              }}
            >
              Actions
            </TableHead>
          </TableRow>
        )}
        itemContent={(index, row) => (
          <TableRow style={{ display: 'flex', width: '100%' }}>
            {columns.map((col) => (
              <TableCell
                key={col.id}
                style={{
                  flex: `0 0 ${col.size || 150}px`,
                  padding: '8px',
                  borderRight: '1px solid #e5e7eb',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {col.cell ? col.cell(row, index) : row[col.accessorKey as string]}
              </TableCell>
            ))}
            <TableCell style={{ flex: '1 1 auto', borderRight: '1px solid #e5e7eb' }} />
            <TableCell
              style={{
                flex: `0 0 ${actionsColumnWidth}px`,
                position: 'sticky',
                right: 0,
                background: 'white',
                borderLeft: '1px solid #e5e7eb',
              }}
            >
              {actionsCell ? actionsCell(row, index) : null}
            </TableCell>
          </TableRow>
        )}
        components={{
          Table: (props) => <Table {...props} style={{ width: '100%', minWidth: totalMinWidth }} />,
          TableHead: React.forwardRef((props, ref) => <TableHeader {...props} ref={ref} className="bg-background sticky top-0 z-10" />),
          TableRow: (props) => <TableRow {...props} style={{ display: 'flex', width: '100%' }} />,
          TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
        }}
      />
    </div>
  );
};
``;
