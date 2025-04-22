import { IconButton } from '@/components/ui/icon-button';
import { TableHead, TableRow } from '@/components/ui/table';
import { ArrowDownAZIcon, ArrowDownUpIcon, ArrowUpAZIcon } from 'lucide-react';
import { ColumnDef } from './table_data';
import { Idable } from './table_types';

export interface TableHeaderComponentProps<T extends Idable> {
  columns: ColumnDef<T>[];
  actionsCell?: boolean;
  actionsColumnWidth?: number;
  onSort: (key: keyof T) => void;
  currentSort?: { key: keyof T; direction: 'asc' | 'desc' | null } | null;
  ghostRef: React.RefObject<HTMLDivElement | null>;
  setColumns: (columns: ColumnDef<T>[]) => void;
}

export const TableHeaderComponent = <T extends Idable>({
  columns,
  actionsCell,
  actionsColumnWidth = 120,
  onSort,
  currentSort,
  ghostRef,
  setColumns,
}: TableHeaderComponentProps<T>) => {
  const startResize = (e: React.MouseEvent, key: keyof T, startWidth: number) => {
    e.stopPropagation();
    e.preventDefault();
    const startX = e.clientX;
    const ghost = ghostRef.current;
    const ghostContainer = ghost?.parentElement;

    if (!ghost || !ghostContainer) return;

    const ghostContainerRect = ghostContainer.getBoundingClientRect();
    const thElement = (e.target as HTMLElement).closest('th');
    if (!thElement) return;
    const thRect = thElement.getBoundingClientRect();

    const initialGhostLeft = thRect.right - ghostContainerRect.left;
    const initialGhostTop = thRect.top - ghostContainerRect.top;

    ghost.style.left = `${initialGhostLeft}px`;
    ghost.style.top = `${initialGhostTop}px`;
    ghost.style.height = `${thRect.height}px`;
    ghost.style.display = 'block';

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentMouseRelativeLeft = moveEvent.clientX - ghostContainerRect.left;
      ghost.style.left = `${currentMouseRelativeLeft}px`;
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      const delta = upEvent.clientX - startX;
      const newSize = Math.max(100, startWidth + delta);
      setColumns(columns.map((col) => (col.accessorKey === key ? { ...col, size: newSize } : col)));

      ghost.style.display = 'none';

      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <TableRow className="flex w-full border-b">
      {columns.map((col) => {
        const isSorted = currentSort?.key === col.accessorKey;
        const direction = currentSort?.direction;
        const width = Math.max(col.size || 150, 50);
        return (
          <TableHead
            key={col.id}
            style={{ flex: `0 0 ${width}px`, position: 'relative', userSelect: 'none' }}
            className="bg-background flex items-center gap-1 truncate border-r p-2"
          >
            <div className="flex w-full items-center gap-1">
              <span className="overflow-hidden text-ellipsis whitespace-nowrap">{col.header}</span>
              {col.sortable && (
                <span>
                  {isSorted ? (
                    direction === 'asc' ? (
                      <IconButton onClick={() => onSort(col.accessorKey)} Icon={ArrowDownAZIcon} className="h-4 w-4" />
                    ) : (
                      <IconButton onClick={() => onSort(col.accessorKey)} Icon={ArrowUpAZIcon} className="h-4 w-4" />
                    )
                  ) : (
                    <IconButton onClick={() => onSort(col.accessorKey)} Icon={ArrowDownUpIcon} className="h-4 w-4" />
                  )}
                </span>
              )}
            </div>
            <div onMouseDown={(e) => startResize(e, col.accessorKey, width)} className="absolute top-0 right-0 z-10 h-full w-1 cursor-col-resize" />
          </TableHead>
        );
      })}
      <TableHead className="bg-background flex-[1_1_auto] border-r" />
      {actionsCell && (
        <TableHead style={{ flex: `0 0 ${actionsColumnWidth}px` }} className="bg-background sticky right-0 z-10 flex items-center border-l">
          Actions
        </TableHead>
      )}
    </TableRow>
  );
};
