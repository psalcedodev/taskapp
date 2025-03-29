import clsx from 'clsx';
import React from 'react';

interface ColumnCellProps {
  cell: string | React.ReactNode;
  className?: string;
}

export const getColumnCell = ({ cell, className }: ColumnCellProps) => {
  return (
    <div className={clsx('h-full flex items-center w-full', className)}>
      {cell}
    </div>
  );
};
