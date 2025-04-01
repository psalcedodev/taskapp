import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React from 'react';
import { TableVirtuoso } from 'react-virtuoso';

interface Column {
  key: string;
  label: string;
  width?: number;
}

interface Props {
  columns: Column[];
  data: Record<string, any>[];
  actionsColumnWidth?: number;
}

export const VirtualizedResizableTable: React.FC<Props> = ({ columns, data, actionsColumnWidth = 120 }) => {
  const totalMinWidth = columns.reduce((acc, col) => acc + (col.width || 150), 0) + actionsColumnWidth;

  return (
    <div className="relative flex-grow overflow-auto rounded-md border">
      <TableVirtuoso
        style={{ height: '100%', width: '100%' }}
        data={data}
        fixedHeaderContent={() => (
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key} style={{ width: col.width || 150, minWidth: col.width || 150 }} className="border-r">
                {col.label}
              </TableHead>
            ))}
            <TableHead
              style={{
                width: actionsColumnWidth,
                position: 'sticky',
                right: 0,
                background: 'white',
                borderLeft: '1px solid #e5e7eb',
                zIndex: 20,
              }}
            >
              Actions
            </TableHead>
          </TableRow>
        )}
        itemContent={(index, row) => (
          <>
            {columns.map((col) => (
              <TableCell key={col.key} style={{ width: col.width || 150, minWidth: col.width || 150 }} className="truncate border-r">
                {row[col.key]}
              </TableCell>
            ))}
            <TableCell
              style={{
                width: actionsColumnWidth,
              }}
              className="sticky right-0 z-10 truncate border-l border-l-gray-200 bg-white"
            >
              <button className="text-blue-600">Edit</button>
            </TableCell>
          </>
        )}
        components={{
          Table: ({ style, ...props }) => <Table {...props} style={style} />,
          TableHead: React.forwardRef((props, ref) => <TableHeader {...props} ref={ref} className="bg-background sticky top-0 z-10" />),
          TableRow: TableRow,
          TableBody: React.forwardRef((props, ref) => <TableBody {...props} ref={ref} />),
        }}
      />
    </div>
  );
};
