import clsx from 'clsx';
import React from 'react';

interface ColumnCellProps {
  cell: string | React.ReactNode;
  className?: string;
}

export const getColumnCell = ({ cell, className }: ColumnCellProps) => {
  return <div className={clsx('flex h-full w-full items-center', className)}>{cell}</div>;
};
