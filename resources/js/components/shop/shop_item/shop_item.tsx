import { Button } from '@/components/ui/button';
import { useAsyncStatus } from '@/hooks/use_async_status';
import { ShopItem as ShopItemType } from '@/pages/parent/shop/types';
import { Coins } from 'lucide-react';
import React from 'react';
import { ShopItemDomain } from './shop_item_domain';

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
export interface ShopItemProps {
  domain: ShopItemDomain;
  idx: number;
}

const PLACEHOLDER_IMAGE = 'https://placehold.co/400x200?text=No+Image';

export const ShopItem: React.FC<ShopItemProps> = ({ domain, idx }) => {
  const color = CARD_COLORS[idx % CARD_COLORS.length];
  const availableFrom = formatDate(domain.shopItem.available_from);
  const availableUntil = formatDate(domain.shopItem.available_until);
  const isLimited = domain.shopItem.is_limited_time;
  const { isPending } = useAsyncStatus(domain.purchaseRunner);

  const isItemAvailable = (item: ShopItemType) => {
    if (!item.is_active) return false;
    if (item.stock !== null && item.stock <= 0) return false;
    if (item.is_limited_time) {
      const now = new Date();
      if (item.available_from && new Date(item.available_from) > now) return false;
      if (item.available_until && new Date(item.available_until) < now) return false;
    }
    return true;
  };
  return (
    <div
      key={domain.shopItem.id}
      style={{
        background: color.bg,
        borderColor: isLimited ? '#EC4899' : color.border,
        borderWidth: isLimited ? 2 : 1,
        boxShadow: isLimited ? '0 0 0 2px #F9A8D4' : undefined,
      }}
      className={`relative rounded-lg p-4 ${!isItemAvailable(domain.shopItem) ? 'opacity-50' : ''}`}
    >
      {domain.shopItem.image_path ? (
        <img src={domain.shopItem.image_path} alt={domain.shopItem.name} className="mb-4 h-32 w-full rounded-md object-cover" />
      ) : (
        <img src={PLACEHOLDER_IMAGE} alt="No image" className="mb-4 h-32 w-full rounded-md object-cover" style={{ backgroundColor: '#f3f4f6' }} />
      )}
      <h3 className="mb-1 font-semibold" style={{ color: '#222' }}>
        {domain.shopItem.name}
      </h3>
      <p className="mt-1 mb-2 text-sm" style={{ color: '#555' }}>
        {domain.shopItem.description}
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
          <span className="font-medium">{domain.shopItem.token_cost}</span>
        </div>
        <Button
          size="sm"
          style={{
            background: isItemAvailable(domain.shopItem) ? '#FFD600' : '#E5E7EB',
            color: isItemAvailable(domain.shopItem) ? '#fff' : '#888',
            border: 'none',
          }}
          onClick={() => domain.makePurchase(domain.shopItem.id)}
          disabled={!isItemAvailable(domain.shopItem) || isPending || domain.child.token_balance < domain.shopItem.token_cost}
        >
          {isPending ? 'Purchasing...' : 'Purchase'}
        </Button>
      </div>
      {isLimited && (
        <div className="mt-2 text-xs font-semibold" style={{ color: '#EC4899' }}>
          Limited time offer
        </div>
      )}
      {domain.shopItem.stock !== null && (
        <div className="mt-2 text-xs" style={{ color: '#888' }}>
          {domain.shopItem.stock} remaining
        </div>
      )}
    </div>
  );
};
