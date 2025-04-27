import { AsyncActionRunner } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import { ShopItemFormDomain } from '@/pages/parent/shop/form/shop_item_form_domain';
import axios from 'axios';
import { ShopItem } from '../types'; // Assuming ShopItem type is in the parent directory

// Define the Port interface for the presenter
export interface CreateShopItemPresenterPort {
  shopItemFormDomain: ObservableValue<ShopItemFormDomain | null>;
  createRunner: AsyncActionRunner<ShopItem | null>; // Runner for the create action
  onClose: () => void;
  handleCreate: () => Promise<void>;
}

export class CreateShopItemPresenter implements CreateShopItemPresenterPort {
  shopItemFormDomain: ObservableValue<ShopItemFormDomain | null>;
  createRunner: AsyncActionRunner<ShopItem | null>;
  onClose: () => void;
  onSuccess: () => void;

  constructor(onClose: () => void, onSuccess: () => void) {
    this.onClose = onClose;
    this.onSuccess = onSuccess;
    // Initialize with default (empty) data
    this.shopItemFormDomain = new ObservableValue<ShopItemFormDomain | null>(new ShopItemFormDomain());
    this.createRunner = new AsyncActionRunner<ShopItem | null>(null);
  }

  async handleCreate(): Promise<void> {
    const domain = this.shopItemFormDomain.getValue();
    if (!domain) {
      console.error('Form domain not initialized.');
      return;
    }

    const isValid = await domain.validate();
    if (!isValid) {
      console.log('Form validation failed.');
      // Optionally show a notification to the user
      return;
    }

    const requestData = domain.toRequestData();
    console.log('Creating shop item with data:', requestData);

    const action = async () => {
      try {
        // Using route helper assuming ziggy is configured
        const response = await axios.post<ShopItem>(route('shop-items.store'), requestData);
        console.log('Shop item created:', response.data);
        this.onSuccess(); // Call success callback (e.g., close modal, refresh list)
        return response.data; // Return the created item
      } catch (error) {
        console.error('Failed to create shop item:', error);
        // Handle error display (e.g., toast notification)
        // Consider parsing error response for specific messages
        throw error; // Re-throw to let the runner know it failed
      }
    };

    // Execute the action using the runner
    this.createRunner.execute(action);
  }
}
