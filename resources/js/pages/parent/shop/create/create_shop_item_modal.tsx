import { Modal } from '@/components/modal/modal';
import { Button } from '@/components/ui/button';
import { useAsyncStatus } from '@/hooks/use_async_status';
import { useAsyncValue } from '@/hooks/use_async_value';
import { ShopItemForm } from '@/pages/parent/shop/form/shop_item_form';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { CreateShopItemPresenter, CreateShopItemPresenterPort } from './create_shop_item_presenter';

interface CreateShopItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateShopItemModal: React.FC<CreateShopItemModalProps> = ({ isOpen, onClose, onSuccess }) => {
  // Instantiate the presenter
  const [presenter] = React.useState<CreateShopItemPresenterPort>(() => {
    return new CreateShopItemPresenter(onClose, onSuccess);
  });

  // Subscribe to presenter values
  const domain = useAsyncValue(presenter.shopItemFormDomain);
  // Get status from the hook
  const { isPending } = useAsyncStatus(presenter.createRunner);
  // Get error directly from the runner
  const error = presenter.createRunner.getError();

  // Reset form domain if modal is closed and reopened (optional)
  // useEffect(() => {
  //   if (!isOpen) {
  //     presenter.shopItemFormDomain.setValue(new ShopItemFormDomain());
  //     presenter.createRunner.reset(); // Reset runner state
  //   }
  // }, [isOpen, presenter]);

  // Only render the modal if isOpen is true
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      title="Create New Shop Item"
      onClose={onClose}
      footerContent={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={() => presenter.handleCreate()} disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Item
          </Button>
        </div>
      }
    >
      <div className="py-4">
        {domain ? <ShopItemForm domain={domain} /> : <div className="flex h-40 items-center justify-center">Loading form...</div>}

        {error && <p className="mt-2 text-sm text-red-600">Failed to create item: {(error as Error)?.message || 'Please try again.'}</p>}
      </div>
    </Modal>
  );
};
