import { Button } from '@/components/ui/button';
import { FamilyChild } from '@/types/task';
import axios from 'axios';
import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { ChildPinModal } from './child_pin_modal';
import { ShopModal } from './shop_modal';

interface ShopAccessButtonProps {
  children: FamilyChild[];
  onPurchaseSuccess: () => void;
}

export const ShopAccessButton = ({ children, onPurchaseSuccess }: ShopAccessButtonProps) => {
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [selectedChild, setSelectedChild] = useState<FamilyChild | null>(null);

  const handleShopAccess = () => {
    if (children.length === 1) {
      // If there's only one child, open shop directly
      setSelectedChild(children[0]);
      setIsShopModalOpen(true);
    } else {
      // For multiple children, show PIN verification
      setIsPinModalOpen(true);
    }
  };

  const handlePinSuccess = (child: FamilyChild) => {
    setSelectedChild(child);
    setIsPinModalOpen(false);
    setIsShopModalOpen(true);
  };

  const updateSelectedChild = async () => {
    if (!selectedChild) return;
    try {
      const response = await axios.get(`/children/${selectedChild.id}`);
      setSelectedChild(response.data);
    } catch (error) {
      // Optionally handle error
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        title="Access Shop"
        onClick={handleShopAccess}
        style={{ color: '#222', borderColor: '#FFD600', background: '#FFF9DB' }}
      >
        <ShoppingBag className="h-4 w-4" />
      </Button>

      {isPinModalOpen && (
        <ChildPinModal children={children} isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} onSuccess={handlePinSuccess} />
      )}

      {isShopModalOpen && selectedChild && (
        <ShopModal
          child={selectedChild}
          isOpen={isShopModalOpen}
          onClose={() => setIsShopModalOpen(false)}
          onPurchaseSuccess={() => {
            onPurchaseSuccess();
            updateSelectedChild();
          }}
        />
      )}
    </>
  );
};
