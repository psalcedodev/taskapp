import { ObservableValue } from '@/hex/observable_value';
import axios from 'axios';
import { toast } from 'sonner';

export interface ShopItem {
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

export interface Purchase {
  id: number;
  item_name: string;
  item_image: string | null;
  item_description: string;
  token_cost: number;
  purchased_at: string;
}

export interface ShopChild {
  id: number;
  name: string;
  token_balance: number;
}

export class ShopPresenter {
  readonly child: ObservableValue<ShopChild>;
  readonly shopItems: ObservableValue<ShopItem[]> = new ObservableValue<ShopItem[]>([]);
  readonly purchases: ObservableValue<Purchase[]> = new ObservableValue<Purchase[]>([]);
  readonly isLoadingShopItems: ObservableValue<boolean> = new ObservableValue<boolean>(false);
  readonly isLoadingPurchases: ObservableValue<boolean> = new ObservableValue<boolean>(false);
  readonly isPurchasing: ObservableValue<{ [itemId: number]: boolean }> = new ObservableValue<{ [itemId: number]: boolean }>({});

  constructor(child: ShopChild) {
    this.child = new ObservableValue<ShopChild>(child);
  }

  fetchShopItems = async () => {
    this.isLoadingShopItems.setValue(true);
    try {
      const response = await axios.get<ShopItem[]>(route('shop.items.list'));
      this.shopItems.setValue(response.data);
    } catch (error) {
      toast.error('Failed to load shop items');
    } finally {
      this.isLoadingShopItems.setValue(false);
    }
  };

  fetchPurchases = async () => {
    this.isLoadingPurchases.setValue(true);
    try {
      const response = await axios.get(`/shop/purchases/${this.child.getValue().id}`);
      this.purchases.setValue(response.data);
    } catch (error) {
      toast.error('Failed to load purchases');
    } finally {
      this.isLoadingPurchases.setValue(false);
    }
  };

  makePurchase = async (shopItemId: number, onSuccess?: () => void) => {
    const current = { ...this.isPurchasing.getValue(), [shopItemId]: true };
    this.isPurchasing.setValue(current);
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const response = await axios.post(route('shop.purchase'), {
        child_id: this.child.getValue().id,
        shop_item_id: shopItemId,
      });
      toast.success(response.data.message);
      // Update child balance
      await this.fetchChild();
      // Refresh shop items and purchases
      await this.fetchShopItems();
      await this.fetchPurchases();
      onSuccess?.();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to purchase item';
      toast.error(message);
    } finally {
      const current = { ...this.isPurchasing.getValue(), [shopItemId]: false };
      this.isPurchasing.setValue(current);
    }
  };

  fetchChild = async () => {
    try {
      const response = await axios.get(`/children/${this.child.getValue().id}`);
      this.child.setValue(response.data);
    } catch (error) {
      // Optionally handle error
    }
  };
}
