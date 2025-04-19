import { ColumnDef, VirtualizedResizableTable } from '@/components/domain_driven/table/table_data';
import { TableSidebar } from '@/components/table_sidebar/table_sidebar';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { IconButton } from '@/components/ui/icon-button';
import { ValueDetail } from '@/components/value_detail/value_detail';
import { useAsyncStatus } from '@/hooks/use_async_status';
import { useAsyncValue } from '@/hooks/use_async_value';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { format } from 'date-fns';
import { PencilIcon, PlusSquareIcon, Trash2Icon } from 'lucide-react';
import React from 'react';
import { CreateTaskModal } from './create/react/create_task_modal';
import { EditTaskModal } from './edit/react/edit_task_modal';
import { TaskManagerPresenter } from './task_manager_presenter';
import { Task } from './types';

export const TaskManager = () => {
  const [presenter] = React.useState(() => {
    const presenter = new TaskManagerPresenter();

    presenter.listTaskDefinitions();
    presenter.listFamilyChildren();
    return presenter;
  });

  const selectedTask = useAsyncValue(presenter.selectedTask);
  const taskToDelete = useAsyncValue(presenter.taskToDelete);
  const { isPending: isDeleting } = useAsyncStatus(presenter.deleteTaskRunner);

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
      id: 'children',
      accessorKey: 'children',
      header: 'Assigned To',
      cell: (row) => row.children.map((child) => child.name).join(', '),
    },
  ];

  const createTaskDomain = useAsyncValue(presenter.createTaskDomain);
  const childrenOptions = useAsyncValue(presenter.childrenRunner);
  const taskIdToEdit = useAsyncValue(presenter.taskIdToEdit);
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
          endAdornments={<IconButton Icon={PlusSquareIcon} onClick={() => presenter.openCreateTaskModal()} title="Add New Task" />}
          actionsCell={(row) => (
            <div className="flex gap-2">
              <IconButton Icon={PencilIcon} onClick={() => presenter.startEditTask(row.id)} title="Edit Task" />
              <IconButton Icon={Trash2Icon} onClick={() => presenter.startDeleteTask(row)} title="Delete Task" isError />
            </div>
          )}
        />
        {selectedTask && (
          <TableSidebar title={selectedTask.title} onClose={() => presenter.setSelectedTask(null)}>
            <div className="flex flex-col gap-4 p-2">
              <ValueDetail label="Description" value={selectedTask.description || '-'} />
              <ValueDetail label="Type" value={selectedTask.type === 'routine' ? 'Routine' : 'Challenge'} />
              <ValueDetail label="Needs Approval" value={selectedTask.needs_approval ? 'Yes' : 'No'} />
              {/* <ValueDetail label="Mandatory" value={selectedTask.is_mandatory ? 'Yes' : 'No'} /> */}
              <ValueDetail label="Collaborative" value={selectedTask.is_collaborative ? 'Yes' : 'No'} />

              <ValueDetail label="Availability" value={`${selectedTask.available_from_time || '-'} to ${selectedTask.available_to_time || '-'}`} />

              {/* <ValueDetail
                label="Recurrence"
                value={
                  selectedTask.recurrence_type !== 'none'
                    ? `${selectedTask.recurrence_type.charAt(0).toUpperCase() + selectedTask.recurrence_type.slice(1)}` +
                      (selectedTask.recurrence_days?.length > 0 ? ` (${selectedTask.recurrence_days.join(', ')})` : '')
                    : 'One-time'
                }
              /> */}
              {selectedTask.recurrence_ends_on && (
                <ValueDetail label="Recurrence Ends" value={format(selectedTask.recurrence_ends_on, 'MMM d, yyyy')} />
              )}

              <ValueDetail
                label="Suggested Duration"
                value={selectedTask.suggested_duration_minutes ? `${selectedTask.suggested_duration_minutes} min` : '-'}
              />

              <div>
                <h4 className="text-foreground mb-1 text-sm font-medium">Assigned Children:</h4>
                {selectedTask.children && selectedTask.children.length > 0 ? (
                  <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
                    {selectedTask.children.map((child) => (
                      <li key={child.id}>{child.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-muted-foreground text-sm">No children assigned.</p>
                )}
              </div>
            </div>
          </TableSidebar>
        )}
      </div>
      {createTaskDomain && <CreateTaskModal presenter={createTaskDomain} childrenOptions={childrenOptions} />}
      {taskIdToEdit && (
        <EditTaskModal
          taskId={taskIdToEdit}
          childrenOptions={childrenOptions}
          onClose={() => presenter.stopEditTask()}
          onSuccess={() => presenter.onSuccessfulEditTask()}
        />
      )}

      <AlertDialog open={!!taskToDelete} onOpenChange={(open) => !open && presenter.cancelDeleteTask()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task
              <span className="font-semibold"> "{taskToDelete?.title}" </span>
              and all its associated assignments and history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => presenter.cancelDeleteTask()} disabled={isDeleting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => presenter.confirmDeleteTask()}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete Task'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default TaskManager;
