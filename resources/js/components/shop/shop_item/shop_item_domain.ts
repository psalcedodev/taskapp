import { AsyncActionRunner } from '@/hex/async_action_runner';
import axios from 'axios';
import { toast } from 'sonner';
import { FieldDomain } from '../../domain_driven/field_domain';
import { ShopItem } from '../shop_presenter';
export interface ShopChild {
  id: number;
  name: string;
  token_balance: number;
}
export class ShopItemDomain {
  readonly quantity: FieldDomain<number>;
  readonly shopItem: ShopItem;
  readonly child: ShopChild;
  readonly purchaseRunner: AsyncActionRunner<void>;
  onSuccess: () => void;
  constructor(shopItem: ShopItem, child: ShopChild, onSuccess: () => void) {
    this.quantity = new FieldDomain<number>('quantity', 1);
    this.shopItem = shopItem;
    this.child = child;
    this.purchaseRunner = new AsyncActionRunner<void>(undefined);
    this.onSuccess = onSuccess;
  }

  makePurchase = async (shopItemId: number) => {
    try {
      const response = await axios.post(route('shop.purchase'), {
        child_id: this.child.id,
        shop_item_id: shopItemId,
      });
      toast.success(response.data.message);
      this.onSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to purchase item';
      toast.error(message);
    }
  };
}
