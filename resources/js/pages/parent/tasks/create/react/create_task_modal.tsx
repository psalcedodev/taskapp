import { ChildOption } from '@/components/domain_driven/fields/child_selection/dd_child_selection';
import { Modal } from '@/components/modal/modal';
import { Button } from '@/components/ui/button';
import React from 'react';
import { TaskForm } from '../../form/react/task_form';
import { CreateTaskPresenterPort } from '../create_task_presenter';

export interface CreateTaskModalProps {
  presenter: CreateTaskPresenterPort;
  childrenOptions: ChildOption[];
}
export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ presenter, childrenOptions }) => {
  return (
    <Modal
      title="Create Task"
      onClose={() => presenter.onClose()}
      footerContent={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => presenter.onClose()}>
            Cancel
          </Button>
          <Button onClick={() => presenter.onClose()}>Create</Button>
        </div>
      }
    >
      <TaskForm domain={presenter.taskFormDomain} childrenOptions={childrenOptions} />
    </Modal>
  );
};
