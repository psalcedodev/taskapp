/**
 * Shop View Component
 *
 * A virtual shop interface where children can spend their earned tokens on rewards.
 * Provides a grid layout of purchasable items with real-time stock tracking and
 * token balance management.
 */

import { Button } from '@/components/ui/button';
import { FamilyChild } from '@/types/task';
import axios from 'axios';
import { Coins, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ShopPresenter } from './shop_presenter';

interface ShopViewProps {
  /** The child who is shopping */
  child: FamilyChild;
  /** Callback triggered after successful purchase to refresh token balance */
  onPurchaseSuccess: () => void;
  /** Callback to close the shop view */
  onClose: () => void;
}

/**
 * Represents a purchasable item in the shop
 */
interface ShopItem {
  /** Unique identifier for the item */
  id: number;
  /** Display name of the item */
  name: string;
  /** Detailed description of the item */
  description: string;
  /** Cost in tokens */
  token_cost: number;
  /** Optional URL to item's image */
  image_url: string | null;
  /** Optional stock count (null means unlimited) */
  stock: number | null;
}

/** Fallback image URL for items without images */
const PLACEHOLDER_IMAGE = 'https://placehold.co/400x200?text=No+Image';
// const CARD_COLORS = [
//   { bg: '#FFF9DB', border: '#FFE066' }, // soft yellow
//   { bg: '#E3F2FD', border: '#90CAF9' }, // soft blue
//   { bg: '#E8F5E9', border: '#A5D6A7' }, // soft green
//   { bg: '#FCE4EC', border: '#F48FB1' }, // soft pink
//   { bg: '#F3E5F5', border: '#CE93D8' }, // soft purple
//   { bg: '#FFF3E0', border: '#FFB74D' }, // soft orange
// ];

/**
 * ShopView Component
 *
 * Features:
 * - Displays current token balance
 * - Grid layout of purchasable items
 * - Real-time stock tracking
 * - Purchase validation (sufficient tokens, available stock)
 * - Loading states for initial load and purchases
 * - Error handling with toast notifications
 */
export const ShopView = ({ child, onPurchaseSuccess, onClose }: ShopViewProps) => {
  const [presenter] = useState(() => new ShopPresenter(child));
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState<{ [key: number]: boolean }>({});

  console.log({ shopItems });

  /**
   * Fetches available shop items from the server
   * Handles loading states and error notifications
   */
  useEffect(() => {
    fetchShopItems();
  }, []);

  const fetchShopItems = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get<ShopItem[]>(route('shop.items.list'));
      setShopItems(response.data);
    } catch (error) {
      toast.error('Failed to load shop items');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles the purchase of an item
   * - Updates purchase loading state
   * - Processes purchase through presenter
   * - Refreshes shop items and token balance on success
   * @param itemId ID of the item being purchased
   */
  const handlePurchase = async (itemId: number) => {
    setIsPurchasing((prev) => ({ ...prev, [itemId]: true }));
    try {
      await presenter.makePurchase(itemId, () => {
        fetchShopItems();
        onPurchaseSuccess();
      });
    } finally {
      setIsPurchasing((prev) => ({ ...prev, [itemId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-8 w-8 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5 text-yellow-500" />
          <span className="text-lg font-semibold">{child.token_balance} Tokens</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shopItems.map((item, idx) => {
          const isPurchasingItem = isPurchasing[item.id] === true;
          const canPurchase = child.token_balance >= item.token_cost && (item.stock === null || item.stock > 0);

          return (
            <div
              key={item.id}
              style={{
                borderWidth: 1,
              }}
              className={`relative rounded-lg p-4`}
            >
              {item.image_url ? (
                <img src={item.image_url} alt={item.name} className="mb-4 h-32 w-full rounded-md object-cover" />
              ) : (
                <img
                  src={PLACEHOLDER_IMAGE}
                  alt="No image"
                  className="mb-4 h-32 w-full rounded-md object-cover"
                  style={{ backgroundColor: '#f3f4f6' }}
                />
              )}
              <h3 className="mb-1 font-semibold" style={{ color: '#222' }}>
                {item.name}
              </h3>
              <p className="mt-1 mb-2 text-sm" style={{ color: '#555' }}>
                {item.description}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center gap-1" style={{ color: '#eab308' }}>
                  <Coins className="h-4 w-4" />
                  <span className="font-medium">{item.token_cost}</span>
                </div>
                <Button
                  size="sm"
                  style={{
                    background: canPurchase ? '#FFD600' : '#E5E7EB',
                    color: canPurchase ? '#fff' : '#888',
                    border: 'none',
                  }}
                  onClick={() => handlePurchase(item.id)}
                  disabled={!canPurchase || isPurchasingItem}
                >
                  {isPurchasingItem ? 'Purchasing...' : 'Purchase'}
                </Button>
              </div>
              {item.stock !== null && (
                <div className="mt-2 text-xs" style={{ color: '#888' }}>
                  {item.stock} remaining
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
