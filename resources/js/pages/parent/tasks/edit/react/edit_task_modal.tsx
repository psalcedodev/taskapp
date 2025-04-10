import { Modal } from '@/components/modal/modal';
import { Task } from '@/types/task';
import React from 'react';

export interface EditTaskModalProps {
  task: Task;
}
export const EditTaskModal: React.FC<EditTaskModalProps> = ({ task }) => {
  return (
    <Modal
      title={`Edit Task: ${task.title}`}
      onClose={() => {}}
      footerContent={
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => {}}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => {}}>
            Save
          </button>
        </div>
      }
    >
      hi
    </Modal>
  );
};
