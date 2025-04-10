import { Modal } from '@/components/modal/modal';
import React from 'react';

export interface EditTaskModalProps {}
export const EditTaskModal: React.FC<EditTaskModalProps> = () => {
  return (
    <Modal
      title="Create Task"
      onClose={() => {}}
      footerContent={
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={() => {}}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={() => {}}>
            Create
          </button>
        </div>
      }
    >
      hi
    </Modal>
  );
};
