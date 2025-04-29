import { cn } from '@/lib/utils';
import { FixedSizeList, ListChildComponentProps } from 'react-window';

interface VirtualizedListProps {
  itemCount: number;
  rowHeight: number;
  gap?: number;
  height?: number | string;
  style?: React.CSSProperties;
  renderItem: (props: ListChildComponentProps) => React.ReactNode;
  className?: string;
}

export const VirtualizedList = ({ itemCount, rowHeight, gap = 0, height, style, renderItem, className }: VirtualizedListProps) => {
  const itemSize = rowHeight + gap;
  return (
    <FixedSizeList
      className={cn('scrollbar-thin scrollbar-track-transparent scrollbar-thumb-gray-300', className)}
      height={height ?? 800}
      itemCount={itemCount}
      itemSize={itemSize}
      width="100%"
      style={style}
    >
      {renderItem}
    </FixedSizeList>
  );
};
