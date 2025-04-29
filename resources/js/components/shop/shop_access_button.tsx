import { Button } from '@/components/ui/button';
import { FamilyChild } from '@/types/task';
import { Coins } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ChildPinModal } from '../child_pin_modal';

interface ShopAccessButtonProps {
  children: FamilyChild[];
  onPurchaseSuccess: () => void;
  onShopAccess: (child: FamilyChild) => void;
  onShopClose: () => void;
}

export const ShopAccessButton = ({ children, onPurchaseSuccess, onShopAccess, onShopClose }: ShopAccessButtonProps) => {
  const [selectedChild, setSelectedChild] = useState<FamilyChild | null>(null);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);

  const handleChildSelect = (child: FamilyChild) => {
    setSelectedChild(child);
    setIsPinModalOpen(true);
  };

  const handlePinSuccess = () => {
    if (selectedChild) {
      onShopAccess(selectedChild);
    }
  };

  // Handle activity timeout
  useEffect(() => {
    if (!selectedChild) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      timeoutId = setTimeout(() => {
        onShopClose();
      }, 60000); // 1 minute timeout
    };

    // Set up event listeners
    const handleActivity = () => {
      resetTimeout();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    // Initial timeout
    resetTimeout();

    // Cleanup
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [selectedChild, onShopClose]);

  return (
    <>
      <div className="relative">
        <Button variant="outline" size="icon" className="h-9 w-9" title="Access Shop" onClick={() => handleChildSelect(children[0])}>
          <Coins className="h-4 w-4" />
        </Button>
      </div>

      {selectedChild && (
        <ChildPinModal child={selectedChild} isOpen={isPinModalOpen} onClose={() => setIsPinModalOpen(false)} onSuccess={handlePinSuccess} />
      )}
    </>
  );
};
