import { ChildOption } from '@/components/domain_driven/fields/child_selection/dd_child_selection';
import { Modal } from '@/components/modal/modal';
import { Button } from '@/components/ui/button';
import { useAsyncStatus } from '@/hooks/use_async_status';
import { useAsyncValue } from '@/hooks/use_async_value';
import React, { useState } from 'react';
import { TaskForm } from '../../form/react/task_form';
import { EditTaskPresenter, EditTaskPresenterPort } from '../edit_task_presenter';

interface EditTaskModalProps {
  taskId: number;
  onClose: () => void;
  onSuccess: () => void;
  childrenOptions: ChildOption[];
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ taskId, onClose, onSuccess, childrenOptions }) => {
  const [presenter] = useState<EditTaskPresenterPort>(() => new EditTaskPresenter(taskId, onClose, onSuccess));
  const { isPending: isLoadPending } = useAsyncStatus(presenter.taskLoadRunner);
  const { isPending: isUpdatePending } = useAsyncStatus(presenter.taskUpdateRunner);
  const taskFormDomain = useAsyncValue(presenter.taskFormDomain);

  const isPending = isLoadPending || isUpdatePending;

  return (
    <Modal
      title="Edit Task"
      onClose={() => !isPending && presenter.onClose()}
      footerContent={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => presenter.onClose()} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={() => presenter.handleUpdate()} loading={isUpdatePending} disabled={isPending || !taskFormDomain}>
            Save Changes
          </Button>
        </div>
      }
    >
      {isLoadPending && <div className="flex items-center justify-center p-4">Loading Task...</div>}
      {!isLoadPending && taskFormDomain && <TaskForm domain={taskFormDomain} childrenOptions={childrenOptions} />}
      {!isLoadPending && !taskFormDomain && (
        <div className="text-destructive-foreground flex items-center justify-center p-4">Failed to load task data.</div>
      )}
    </Modal>
  );
};
