import { TableHead, TableRow } from '@/components/ui/table';
import { ArrowDownAZIcon, ArrowDownUpIcon, ArrowDownZA } from 'lucide-react';
import { useRef } from 'react';
import { ColumnDef } from './table_data';
import { Idable } from './table_types';

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
