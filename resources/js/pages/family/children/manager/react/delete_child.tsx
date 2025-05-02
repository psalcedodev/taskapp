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
import { useAsyncStatus } from '@/hooks/use_async_status';
import { useAsyncValue } from '@/hooks/use_async_value';
import React from 'react';
import { ChildrenManagerPresenter } from '../children_manager_presenter';

export interface DeleteChildProps {
  presenter: ChildrenManagerPresenter;
}
export const DeleteChild: React.FC<DeleteChildProps> = ({ presenter }) => {
  const { isPending: isDeleting } = useAsyncStatus(presenter.deleteChildRunner);
  const childToDelete = useAsyncValue(presenter.childToDelete);

  return (
    <AlertDialog open={!!childToDelete} onOpenChange={(open) => !open && presenter.cancelDeleteChild()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the task
            <span className="font-semibold"> "{childToDelete?.name}" </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => presenter.cancelDeleteChild()} disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => presenter.confirmDeleteChild()}
            disabled={isDeleting}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            {isDeleting ? 'Deleting...' : 'Delete Child'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
