import { Modal } from '@/components/modal/modal';
import { Button } from '@/components/ui/button';
import { useAsyncStatus } from '@/hooks/use_async_status';
import React from 'react';
import { ChildrenApiAdapter } from '../../adapter/children_api_adapter';
import { Child } from '../../children_types';
import { ChildForm } from '../../form/react/child_form';
import { EditChildPresenter } from '../edit_child_presenter';
interface ChildrenEditModalProps {
  child: Child;
  onClose: () => void;
  onSuccess: () => void;
}

export const ChildrenEditModal: React.FC<ChildrenEditModalProps> = ({ child, onClose, onSuccess }) => {
  const [api] = React.useState(() => new ChildrenApiAdapter());
  const [presenter] = React.useState(() => new EditChildPresenter(api, child, onSuccess, onClose));
  const { isPending } = useAsyncStatus(presenter.updateChildRunner);
  return (
    <Modal
      title="Edit Child"
      onClose={() => presenter.cancel()}
      footerContent={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => presenter.cancel()}>
            Cancel
          </Button>
          <Button onClick={() => presenter.updateChild()} loading={isPending} disabled={isPending}>
            Save
          </Button>
        </div>
      }
    >
      <ChildForm domain={presenter.formDomain} />
    </Modal>
  );
};
