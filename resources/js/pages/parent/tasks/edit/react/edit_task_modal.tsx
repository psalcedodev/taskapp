import { ChildOption } from '@/components/domain_driven/fields/child_selection/dd_child_selection';
import { Modal } from '@/components/modal/modal';
import { Button } from '@/components/ui/button';
import { useAsyncStatus } from '@/hooks/use_async_status';
import { useAsyncValue } from '@/hooks/use_async_value';
import React, { useState } from 'react';
import { TaskForm } from '../../form/react/task_form';
import { EditTaskPresenter } from '../edit_task_presenter';

interface EditTaskModalProps {
  taskId: number;
  onClose: () => void;
  onSuccess: () => void;
  childrenOptions: ChildOption[];
}

export const EditTaskModal: React.FC<EditTaskModalProps> = ({ taskId, onClose, onSuccess, childrenOptions }) => {
  const [presenter] = useState(() => new EditTaskPresenter(taskId, onClose, onSuccess));
  const { isPending } = useAsyncStatus(presenter?.taskRunner);
  const taskFormDomain = useAsyncValue(presenter.taskFormDomain);

  if (!presenter) return null;

  return (
    <Modal
      title="Edit Task"
      onClose={() => presenter.onClose()}
      footerContent={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => presenter.onClose()}>
            Cancel
          </Button>
          <Button onClick={() => presenter.onClose()}>Save</Button>
        </div>
      }
    >
      {isPending && <div className="flex items-center justify-center p-4">Loading...</div>}
      {taskFormDomain && <TaskForm domain={taskFormDomain} childrenOptions={childrenOptions} />}
    </Modal>
  );
};
