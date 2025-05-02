import { Modal } from '@/components/modal/modal';
import { Button } from '@/components/ui/button';
import { useAsyncStatus } from '@/hooks/use_async_status';
import React from 'react';
import { ChildForm } from '../../form/react/child_form';
import { CreateChildPresenter } from '../create_child_presenter';

interface ChildrenCreateModalProps {
  presenter: CreateChildPresenter;
  onClose: () => void;
}

export const ChildrenCreateModal: React.FC<ChildrenCreateModalProps> = ({ presenter, onClose }) => {
  const { isPending } = useAsyncStatus(presenter.createChildRunner);
  return (
    <Modal
      title="Create Child"
      onClose={() => presenter.cancel()}
      footerContent={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => presenter.cancel()}>
            Cancel
          </Button>
          <Button onClick={() => presenter.createChild()} loading={isPending} disabled={isPending}>
            Save
          </Button>
        </div>
      }
    >
      <ChildForm domain={presenter.formDomain} />
    </Modal>
  );
};
