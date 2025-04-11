import { ColumnDef, VirtualizedResizableTable } from '@/components/domain_driven/table/table_data';
import { TableSidebar } from '@/components/table_sidebar/table_sidebar';
import { IconButton } from '@/components/ui/icon-button';
import { ValueDetail } from '@/components/value_detail/value_detail';
import { useAsyncValue } from '@/hooks/use_async_value';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { PencilIcon, PlusSquareIcon, Trash2Icon } from 'lucide-react';
import React from 'react';
import { CreateTaskModal } from './create/react/create_task_modal';
import { TaskManagerPresenter } from './task_manager_presenter';
import { Task } from './types';

export const TaskManager = () => {
  const [presenter] = React.useState(() => {
    const presenter = new TaskManagerPresenter();

    presenter.listFamilyTasks();
    presenter.listFamilyChildren();
    return presenter;
  });

  const selectedTask = useAsyncValue(presenter.selectedTask);
  console.log({ selectedTask });

  const columns: ColumnDef<Task>[] = [
    {
      id: 'title',
      accessorKey: 'title',
      header: 'Title',
      cell: (row) => row.title,
      sortable: true,
    },
    {
      id: 'needs_approval',
      accessorKey: 'needs_approval',
      header: 'Needs Approval',
      cell: (row) => (row.needs_approval ? 'Yes' : 'No'),
      sortable: true,
    },
    {
      id: 'type',
      accessorKey: 'type',
      header: 'Type',
      cell: (row) => (row.type === 'routine' ? 'Routine' : 'Challenge'),
    },
    {
      id: 'is_collaborative',
      accessorKey: 'is_collaborative',
      header: 'Collaborative',
      cell: (row) => (row.is_collaborative ? 'Yes' : 'No'),
    },
    {
      id: 'assigned_to',
      accessorKey: 'assigned_to',
      header: 'Assigned To',
      cell: (row) => row.assigned_to.map((child) => child.name).join(', '),
    },
  ];

  const createTaskDomain = useAsyncValue(presenter.createTaskDomain);
  const childrenOptions = useAsyncValue(presenter.childrenRunner);
  return (
    <AppLayout>
      <Head title="Tasks Manager" />
      <div className="flex h-full w-full flex-row gap-4 p-4">
        <VirtualizedResizableTable
          title="Tasks Manager"
          columns={columns}
          dataRunner={presenter.tasksRunner}
          actionsColumnWidth={90}
          selectedRowId={selectedTask?.id ?? null}
          onRowClick={(row) => presenter.setSelectedTask(row)}
          endAdornments={<IconButton Icon={PlusSquareIcon} onClick={() => presenter.openCreateTaskModal()} />}
          actionsCell={(row) => (
            <div className="flex gap-2">
              <IconButton Icon={PencilIcon} onClick={() => presenter.getSelectedTask(row.id)} />
              <IconButton Icon={Trash2Icon} onClick={() => console.log('Delete', row.id)} />
            </div>
          )}
        />
        {selectedTask && (
          <TableSidebar title={selectedTask.title} onClose={() => presenter.setSelectedTask(null)}>
            <div className="flex flex-col gap-2">
              <ValueDetail label="Title" value={selectedTask.title} />
            </div>
          </TableSidebar>
        )}
      </div>
      {createTaskDomain && <CreateTaskModal presenter={createTaskDomain} childrenOptions={childrenOptions} />}
    </AppLayout>
  );
};

export default TaskManager;
