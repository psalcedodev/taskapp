import clsx from 'clsx';
import React from 'react';

export interface ValueGroupProps {
  title: string;
  endAdornment?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}
export const ValueGroup: React.FC<ValueGroupProps> = ({
  title,
  endAdornment,
  children,
  className,
}) => {
  return (
    <div className={clsx('flex flex-col gap-2', className)}>
      <div className={'flex justify-between p-2 text-slate-500 bg-stone-100 '}>
        <span>{title}</span>
        {endAdornment && <div>{endAdornment}</div>}
      </div>
      <div className="flex flex-col gap-2 px-2">{children}</div>
    </div>
  );
};
