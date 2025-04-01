import { XIcon } from 'lucide-react';
import React from 'react';
import { IconButton } from '../ui/icon-button';

export interface TableSidebarProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}
export const TableSidebar: React.FC<TableSidebarProps> = ({ title, onClose, children }) => {
  return (
    <div className="bg-background h-full w-[400px] rounded-md border">
      <div className="flex items-center justify-between border-b py-2">
        <h2 className="px-2 text-lg font-semibold">{title}</h2>
        <div className="flex gap-2 border-l px-2">
          <IconButton Icon={XIcon} onClick={onClose} />
        </div>
      </div>
      <div className="flex flex-col justify-between p-2">{children}</div>
    </div>
  );
};
