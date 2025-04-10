import { TableCell } from '@/components/ui/table';
import React from 'react';
import { ColumnDef } from './table_data';
import { Idable } from './table_types';

type TableRowComponentProps<T extends Idable> = {
  rowIndex: number;
  columns: ColumnDef<T>[];
  actionsCell?: (row: T, index: number) => React.ReactNode;
  actionsColumnWidth: number;
  row: T;
  isSelected: boolean;
};

export const TableRowComponent = <T extends Idable>({
  rowIndex,
  columns,
  actionsCell,
  actionsColumnWidth,
  row,
  isSelected,
}: TableRowComponentProps<T>) => {
  return (
    <>
      {columns.map((col) => (
        <TableCell
          key={col.id}
          style={{ flex: `0 0 ${Math.max(col.size || 150, 50)}px` }}
          className={`group-hover:bg-muted flex items-center overflow-hidden border-r border-b p-2 text-ellipsis whitespace-nowrap ${isSelected ? 'bg-muted' : ''}`}
        >
          {col.cell(row, rowIndex)}
        </TableCell>
      ))}
      <TableCell className={`bg-background group-hover:bg-muted flex-[1_1_auto] border-b ${isSelected ? 'bg-muted' : ''}`} />
      {actionsCell && (
        <TableCell
          style={{ flex: `0 0 ${actionsColumnWidth}px` }}
          onClick={(e) => e.stopPropagation()}
          className={`bg-background group-hover:bg-muted sticky right-0 flex items-center border-b border-l p-2 ${isSelected ? 'bg-muted' : ''}`}
        >
          {actionsCell(row, rowIndex)}
        </TableCell>
      )}
    </>
  );
};
