import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IconButton } from '@/components/ui/icon-button';
import { useAsyncStatus } from '@/hooks/use_async_status';
import { XIcon } from 'lucide-react';
import React from 'react';
import { UserForm } from '../../form/user_form';
import { CreateUserPresenter } from '../create_user_presenter';

export interface CreateUserModalProps {
  presenter: CreateUserPresenter;
}
export const CreateUserModal: React.FC<CreateUserModalProps> = ({ presenter }) => {
  const { isPending } = useAsyncStatus(presenter.createRunner);

  return (
    <Dialog open>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center justify-between border-b p-3">
          <DialogTitle>Create User</DialogTitle>
          <div className="flex gap-2 border-l pl-3">
            <IconButton Icon={XIcon} onClick={() => presenter.onClose()} />
          </div>
        </DialogHeader>
        <div className="p-3">
          <UserForm presenter={presenter.formPresenter} />
        </div>
        <DialogFooter className="border-t p-3">
          <Button variant="ghost" onClick={() => presenter.onClose()}>
            Cancel
          </Button>
          <Button disabled={isPending} loading={isPending} onClick={() => presenter.handleSubmit()}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
