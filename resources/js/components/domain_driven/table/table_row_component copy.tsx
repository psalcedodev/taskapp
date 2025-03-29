import { TableCell, TableRow } from '@/components/ui/table';
import React from 'react';
import { Idable, RowAction, TableColumn } from './table_types';

type TableRowComponentProps<T extends Idable> = {
  index: number;
  style: React.CSSProperties;
  columns: TableColumn<T>[];
  rowActions: RowAction<T>[] | undefined;
  actionColumnWidth: number;
  item: T;
  onRowClick?: (index: number, item: T) => void;
};

export const TableRowComponent = <T extends Idable>({
  index,
  style,
  columns,
  rowActions,
  actionColumnWidth,
  item,
  onRowClick,
}: TableRowComponentProps<T>) => {
  const totalWidth = window.innerWidth - actionColumnWidth;

  return (
    <TableRow key={item.id} onClick={() => onRowClick?.(index, item)} style={style} className="relative w-full cursor-pointer hover:bg-gray-100">
      {columns.map((column, colIndex) => {
        const columnWidth = column.width ?? totalWidth / columns.length;
        return (
          <TableCell className="text-left" style={{ minWidth: `${columnWidth}px` }} key={colIndex}>
            {column.getValue(item)}
          </TableCell>
        );
      })}
      {rowActions && (
        <TableCell
          className="absolute top-[-1px] right-0 z-10 border-t border-b border-l border-gray-200 bg-white"
          style={{
            width: `${actionColumnWidth}px`,
          }}
        >
          <div className="flex flex-row gap-2 text-left">
            {rowActions.map((action, actionIndex) =>
              action.canAct?.(item) !== false ? (
                <span
                  key={actionIndex}
                  title={action.tooltip}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.callback(item);
                  }}
                  className="cursor-pointer"
                >
                  {action.Icon}
                </span>
              ) : null,
            )}
          </div>
        </TableCell>
      )}
    </TableRow>
  );
};
