import { Modal } from '@/components/modal/modal';
import { Button } from '@/components/ui/button';
import { useAsyncValue } from '@/hooks/use_async_value';
import { FamilyChild } from '@/types/task';
import axios from 'axios';
import { Coins, ShoppingBag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ShopPresenter } from './shop_presenter';

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x200?text=No+Image'; // You can replace this with a local asset if desired
const CARD_COLORS = [
  { bg: '#FFF9DB', border: '#FFE066' }, // soft yellow
  { bg: '#E3F2FD', border: '#90CAF9' }, // soft blue
  { bg: '#E8F5E9', border: '#A5D6A7' }, // soft green
  { bg: '#FCE4EC', border: '#F48FB1' }, // soft pink
  { bg: '#F3E5F5', border: '#CE93D8' }, // soft purple
  { bg: '#FFF3E0', border: '#FFB74D' }, // soft orange
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface ShopItem {
  id: number;
  name: string;
  description: string;
  image_path: string | null;
  token_cost: number;
  stock: number | null;
  is_active: boolean;
  is_limited_time: boolean;
  available_from: string | null;
  available_until: string | null;
}

interface ShopModalProps {
  child: FamilyChild;
  isOpen: boolean;
  onClose: () => void;
  onPurchaseSuccess: () => void;
}

export const ShopModal = ({ child, isOpen, onClose, onPurchaseSuccess }: ShopModalProps) => {
  const [presenter] = useState(() => new ShopPresenter(child));
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isPurchasing = useAsyncValue(presenter.isPurchasing);
  const [activeTab, setActiveTab] = useState<'shop' | 'purchases'>('shop');
  const [purchases, setPurchases] = useState<any[]>([]);
  const [isLoadingPurchases, setIsLoadingPurchases] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchShopItems();
      if (activeTab === 'purchases') fetchPurchases();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && activeTab === 'purchases') {
      fetchPurchases();
    }
  }, [activeTab, isOpen]);

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

  const fetchPurchases = async () => {
    setIsLoadingPurchases(true);
    try {
      const response = await axios.get(`/shop/purchases/${child.id}`);
      setPurchases(response.data);
    } catch (error) {
      toast.error('Failed to load purchases');
    } finally {
      setIsLoadingPurchases(false);
    }
  };

  const isItemAvailable = (item: ShopItem) => {
    if (!item.is_active) return false;
    if (item.stock !== null && item.stock <= 0) return false;
    if (item.is_limited_time) {
      const now = new Date();
      if (item.available_from && new Date(item.available_from) > now) return false;
      if (item.available_until && new Date(item.available_until) < now) return false;
    }
    return true;
  };

  if (!isOpen) return null;

  return (
    <Modal
      title="Reward Shop"
      onClose={onClose}
      footerContent={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2" style={{ color: '#eab308' }}>
            <Coins className="h-5 w-5" />
            <span className="font-bold">{child.token_balance}</span>
          </div>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      }
      width="max-w-4xl"
    >
      <div className="mb-4 flex gap-2">
        <Button
          variant={activeTab === 'shop' ? 'default' : 'outline'}
          style={{ background: activeTab === 'shop' ? '#FFD600' : '#FFF9DB', color: '#222', borderColor: '#FFD600' }}
          onClick={() => setActiveTab('shop')}
        >
          Shop
        </Button>
        <Button
          variant={activeTab === 'purchases' ? 'default' : 'outline'}
          style={{ background: activeTab === 'purchases' ? '#FFD600' : '#FFF9DB', color: '#222', borderColor: '#FFD600' }}
          onClick={() => setActiveTab('purchases')}
        >
          My Purchases
        </Button>
      </div>
      {activeTab === 'shop' ? (
        isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-center">
              <ShoppingBag className="mx-auto h-8 w-8 animate-pulse" />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shopItems.map((item, idx) => {
              const color = CARD_COLORS[idx % CARD_COLORS.length];
              const availableFrom = formatDate(item.available_from);
              const availableUntil = formatDate(item.available_until);
              const isLimited = item.is_limited_time;
              const isPurchasingItem = isPurchasing[item.id] === true;
              return (
                <div
                  key={item.id}
                  style={{
                    background: color.bg,
                    borderColor: isLimited ? '#EC4899' : color.border,
                    borderWidth: isLimited ? 2 : 1,
                    boxShadow: isLimited ? '0 0 0 2px #F9A8D4' : undefined,
                  }}
                  className={`relative rounded-lg p-4 ${!isItemAvailable(item) ? 'opacity-50' : ''}`}
                >
                  {item.image_path ? (
                    <img src={item.image_path} alt={item.name} className="mb-4 h-32 w-full rounded-md object-cover" />
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
                  {(availableFrom || availableUntil) && (
                    <div className="mb-1 text-xs" style={{ color: '#2563eb' }}>
                      {availableFrom && availableUntil
                        ? `Available: ${availableFrom} – ${availableUntil}`
                        : availableFrom
                          ? `Available from: ${availableFrom}`
                          : `Available until: ${availableUntil}`}
                    </div>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1" style={{ color: '#eab308' }}>
                      <Coins className="h-4 w-4" />
                      <span className="font-medium">{item.token_cost}</span>
                    </div>
                    <Button
                      size="sm"
                      style={{
                        background: isItemAvailable(item) ? '#FFD600' : '#E5E7EB',
                        color: isItemAvailable(item) ? '#fff' : '#888',
                        border: 'none',
                      }}
                      onClick={() =>
                        presenter.makePurchase(item.id, () => {
                          fetchShopItems();
                          fetchPurchases();
                          onPurchaseSuccess();
                        })
                      }
                      disabled={!isItemAvailable(item) || isPurchasingItem || child.token_balance < item.token_cost}
                    >
                      {isPurchasingItem ? 'Purchasing...' : 'Purchase'}
                    </Button>
                  </div>
                  {isLimited && (
                    <div className="mt-2 text-xs font-semibold" style={{ color: '#EC4899' }}>
                      Limited time offer
                    </div>
                  )}
                  {item.stock !== null && (
                    <div className="mt-2 text-xs" style={{ color: '#888' }}>
                      {item.stock} remaining
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : isLoadingPurchases ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <ShoppingBag className="mx-auto h-8 w-8 animate-pulse" />
          </div>
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center text-gray-500">No purchases yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {purchases.map((purchase, idx) => {
            const color = CARD_COLORS[idx % CARD_COLORS.length];
            return (
              <div
                key={purchase.id}
                style={{
                  background: color.bg,
                  borderColor: color.border,
                  borderWidth: 1,
                }}
                className="relative rounded-lg p-4"
              >
                {purchase.item_image ? (
                  <img src={purchase.item_image} alt={purchase.item_name} className="mb-4 h-32 w-full rounded-md object-cover" />
                ) : (
                  <img
                    src={PLACEHOLDER_IMAGE}
                    alt="No image"
                    className="mb-4 h-32 w-full rounded-md object-cover"
                    style={{ backgroundColor: '#f3f4f6' }}
                  />
                )}
                <h3 className="mb-1 font-semibold" style={{ color: '#222' }}>
                  {purchase.item_name}
                </h3>
                <p className="mt-1 mb-2 text-sm" style={{ color: '#555' }}>
                  {purchase.item_description}
                </p>
                <div className="mb-2 flex items-center gap-1" style={{ color: '#eab308' }}>
                  <Coins className="h-4 w-4" />
                  <span className="font-medium">{purchase.token_cost}</span>
                </div>
                <div className="text-xs" style={{ color: '#2563eb' }}>
                  Purchased: {new Date(purchase.purchased_at).toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
};
