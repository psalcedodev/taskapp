import { Button } from '@/components/ui/button';
import { FamilyChild } from '@/types/task';
import axios from 'axios';
import { ArrowLeft, Coins, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ShopPresenter } from './shop_presenter';

interface ShopViewProps {
  child: FamilyChild;
  onPurchaseSuccess: () => void;
  onClose: () => void;
}

interface ShopItem {
  id: number;
  name: string;
  description: string;
  token_cost: number;
  image_url: string | null;
  stock: number | null;
}

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x200?text=No+Image';
const CARD_COLORS = [
  { bg: '#FFF9DB', border: '#FFE066' }, // soft yellow
  { bg: '#E3F2FD', border: '#90CAF9' }, // soft blue
  { bg: '#E8F5E9', border: '#A5D6A7' }, // soft green
  { bg: '#FCE4EC', border: '#F48FB1' }, // soft pink
  { bg: '#F3E5F5', border: '#CE93D8' }, // soft purple
  { bg: '#FFF3E0', border: '#FFB74D' }, // soft orange
];

export const ShopView = ({ child, onPurchaseSuccess, onClose }: ShopViewProps) => {
  const [presenter] = useState(() => new ShopPresenter(child));
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState<{ [key: number]: boolean }>({});

  console.log({ shopItems });

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
          <Button variant="outline" size="sm" onClick={onClose} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Tasks
          </Button>
          <Coins className="h-5 w-5 text-yellow-500" />
          <span className="text-lg font-semibold">{child.token_balance} Tokens</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shopItems.map((item, idx) => {
          const color = CARD_COLORS[idx % CARD_COLORS.length];
          const isPurchasingItem = isPurchasing[item.id] === true;
          const canPurchase = child.token_balance >= item.token_cost && (item.stock === null || item.stock > 0);

          return (
            <div
              key={item.id}
              style={{
                background: color.bg,
                borderColor: color.border,
                borderWidth: 1,
              }}
              className={`relative rounded-lg p-4 ${!canPurchase ? 'opacity-50' : ''}`}
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
