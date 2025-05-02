import { VirtualizedResizableTable } from '@/components/domain_driven/table/table_data';
import { IconButton } from '@/components/ui/icon-button';
import { useAsyncValue } from '@/hooks/use_async_value';
import { PencilIcon, PlusSquareIcon, Trash2Icon } from 'lucide-react';
import React from 'react';
import { ChildrenManagerPresenter } from '../children_manager_presenter';
import { childrenTableColumns } from './children_table_columns';

export interface ChildrenTableProps {
  presenter: ChildrenManagerPresenter;
}
export const ChildrenTable: React.FC<ChildrenTableProps> = ({ presenter }) => {
  const selectedChild = useAsyncValue(presenter.selectedChild);
  return (
    <VirtualizedResizableTable
      title="Children Manager"
      columns={childrenTableColumns}
      dataRunner={presenter.childrenRunner}
      actionsColumnWidth={90}
      selectedRowId={selectedChild?.id ?? null}
      onRowClick={(row) => presenter.setSelectedChild(row)}
      endAdornments={<IconButton Icon={PlusSquareIcon} onClick={() => presenter.openCreateModal()} title="Add New Task" />}
      actionsCell={(row) => (
        <div className="flex gap-2">
          <IconButton Icon={PencilIcon} onClick={() => presenter.startEditChild(row)} title="Edit Task" />
          <IconButton Icon={Trash2Icon} onClick={() => presenter.startDeleteChild(row)} title="Delete Task" isError />
        </div>
      )}
    />
  );
};
