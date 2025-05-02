import { TableSidebar } from '@/components/table_sidebar/table_sidebar';
import { ValueDetail } from '@/components/value_detail/value_detail';
import React from 'react';
import { Child } from '../../children_types';

interface ChildrenSidebarProps {
  child: Child;
  onClose: () => void;
}

export const ChildrenSidebar: React.FC<ChildrenSidebarProps> = ({ child, onClose }) => {
  return (
    <TableSidebar title={child.name} onClose={onClose}>
      <div className="flex flex-col gap-4 p-2">
        <ValueDetail label="Name" value={child.name} />
        <ValueDetail label="Token Balance" value={child.token_balance} />
        {/* Add more child details here as needed */}
      </div>
    </TableSidebar>
  );
};
