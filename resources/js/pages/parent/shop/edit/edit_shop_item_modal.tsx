import { Modal } from '@/components/modal/modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAsyncStatus } from '@/hooks/use_async_status';
import { useAsyncValue } from '@/hooks/use_async_value';
import { ShopItemForm } from '@/pages/parent/shop/form/shop_item_form';
import { Loader2 } from 'lucide-react';
import React from 'react';
import { EditShopItemPresenter, EditShopItemPresenterPort } from './edit_shop_item_presenter';

interface EditShopItemModalProps {
  shopItemId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const EditShopItemModal: React.FC<EditShopItemModalProps> = ({ shopItemId, isOpen, onClose, onSuccess }) => {
  const presenter = React.useMemo<EditShopItemPresenterPort>(() => {
    return new EditShopItemPresenter(shopItemId, onClose, onSuccess);
  }, [shopItemId, onClose, onSuccess]);

  const domain = useAsyncValue(presenter.shopItemFormDomain);
  const { isPending: isLoading } = useAsyncStatus(presenter.itemLoadRunner);
  const loadError = presenter.itemLoadRunner.getError();
  const { isPending: isUpdating } = useAsyncStatus(presenter.itemUpdateRunner);
  const updateError = presenter.itemUpdateRunner.getError();

  if (!isOpen) {
    return null;
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4 py-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-10 w-1/2" />
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
      );
    }

    if (loadError) {
      return <p className="py-4 text-center text-red-600">Error loading item details: {(loadError as Error)?.message || 'Unknown error'}</p>;
    }

    if (domain) {
      return <ShopItemForm domain={domain} isEdit />;
    }

    return <p className="py-4 text-center text-gray-500">Could not load item form.</p>;
  };

  return (
    <Modal
      title="Edit Shop Item"
      onClose={onClose}
      footerContent={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isUpdating || isLoading}>
            Cancel
          </Button>
          <Button onClick={() => presenter.handleUpdate()} disabled={isUpdating || isLoading || !domain}>
            {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Item
          </Button>
        </div>
      }
    >
      <div className="py-4">
        {renderContent()}

        {updateError && <p className="mt-2 text-sm text-red-600">Failed to update item: {(updateError as Error)?.message || 'Please try again.'}</p>}
      </div>
    </Modal>
  );
};
