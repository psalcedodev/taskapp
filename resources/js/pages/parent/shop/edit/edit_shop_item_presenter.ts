import { AsyncActionRunner } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import { ShopItemFormDomain } from '@/pages/parent/shop/form/shop_item_form_domain';
import { ShopItemRequestData } from '@/pages/parent/shop/form/types';
import axios from 'axios';
import { ShopItem } from '../types';

// Define the Port interface for the presenter
export interface EditShopItemPresenterPort {
  shopItemId: number;
  shopItemFormDomain: ObservableValue<ShopItemFormDomain | null>;
  itemLoadRunner: AsyncActionRunner<ShopItem | null>;
  itemUpdateRunner: AsyncActionRunner<ShopItem | null>;
  onClose: () => void;
  handleUpdate: () => Promise<void>;
}

export class EditShopItemPresenter implements EditShopItemPresenterPort {
  shopItemId: number;
  shopItemFormDomain: ObservableValue<ShopItemFormDomain | null>;
  itemLoadRunner: AsyncActionRunner<ShopItem | null>;
  itemUpdateRunner: AsyncActionRunner<ShopItem | null>;
  onClose: () => void;
  onSuccess: () => void;

  constructor(shopItemId: number, onClose: () => void, onSuccess: () => void) {
    this.shopItemId = shopItemId;
    this.onClose = onClose;
    this.onSuccess = onSuccess;

    this.shopItemFormDomain = new ObservableValue<ShopItemFormDomain | null>(null);
    this.itemLoadRunner = new AsyncActionRunner<ShopItem | null>(null);
    this.itemUpdateRunner = new AsyncActionRunner<ShopItem | null>(null);

    // Fetch the item data when the presenter is created
    this.loadShopItem();
  }

  private loadShopItem() {
    this.itemLoadRunner.execute(async () => {
      try {
        const response = await axios.get<ShopItem>(route('shop-items.show', this.shopItemId));
        const itemData = response.data;

        // Convert API data shape (ShopItem) to form data shape (ShopItemRequestData)
        // This might involve renaming or selecting specific fields if they differ significantly,
        // but based on our current types, they are quite similar.
        const formData: ShopItemRequestData = {
          name: itemData.name,
          description: itemData.description,
          image_path: itemData.image_path,
          token_cost: itemData.token_cost,
          needs_approval: itemData.needs_approval,
          is_limited_time: itemData.is_limited_time,
          available_from: itemData.available_from,
          available_until: itemData.available_until,
          is_active: itemData.is_active,
        };

        this.shopItemFormDomain.setValue(new ShopItemFormDomain(formData));
        return itemData;
      } catch (error) {
        console.error('Failed to load shop item:', error);
        this.shopItemFormDomain.setValue(null); // Ensure domain is null on error
        throw error; // Re-throw for runner state
      }
    });
  }

  async handleUpdate(): Promise<void> {
    const domain = this.shopItemFormDomain.getValue();
    if (!domain) {
      console.error('Form domain not loaded yet.');
      return;
    }

    const isValid = await domain.validate();
    if (!isValid) {
      console.log('Form validation failed.');
      return;
    }

    const requestData = domain.toRequestData();
    console.log('Updating shop item with data:', requestData);

    const action = async () => {
      try {
        const response = await axios.put<ShopItem>(route('shop-items.update', this.shopItemId), requestData);
        console.log('Shop item updated:', response.data);
        this.onSuccess(); // Call success callback
        return response.data; // Return the updated item
      } catch (error) {
        console.error('Failed to update shop item:', error);
        // Handle error display
        throw error;
      }
    };

    this.itemUpdateRunner.execute(action);
  }
}
