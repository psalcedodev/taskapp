import { AsyncActionRunner } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import axios from 'axios';
import { ShopItem } from './types'; // Import the ShopItem type

export class ShopManagerPresenter {
  // Runner for fetching the list of items
  shopItemsRunner: AsyncActionRunner<ShopItem[]>;
  // Observable for the currently selected item (for sidebar display, etc.)
  selectedShopItem: ObservableValue<ShopItem | null>;
  // Runner for handling the delete action
  deleteItemRunner: AsyncActionRunner<void>;

  constructor() {
    this.shopItemsRunner = new AsyncActionRunner<ShopItem[]>([]); // Initialize with empty array
    this.selectedShopItem = new ObservableValue<ShopItem | null>(null);
    this.deleteItemRunner = new AsyncActionRunner<void>(undefined); // Initialize delete runner
  }

  // Method to fetch the list of shop items
  listShopItems = () => {
    // Use arrow function for stable identity if passed as prop
    this.shopItemsRunner.execute(async () => {
      try {
        const response = await axios.get<ShopItem[]>(route('shop-items.index'));
        console.log('Fetched Shop Items:', response.data);
        return response.data ?? []; // Return data or empty array
      } catch (error) {
        console.error('Failed to fetch shop items:', error);
        return []; // Return empty array on error
      }
    });
  };

  // Method to set the selected item
  setSelectedShopItem = (item: ShopItem | null) => {
    this.selectedShopItem.setValue(item);
  };

  // Method to handle item deletion
  handleDeleteItem = (itemId: number) => {
    // Optionally add a confirmation step here before executing
    const action = async () => {
      try {
        await axios.delete(route('shop-items.destroy', itemId));
        console.log('Deleted shop item:', itemId);
        // Refresh the list after successful deletion
        this.listShopItems();
        // Clear selection if the deleted item was selected
        if (this.selectedShopItem.getValue()?.id === itemId) {
          this.setSelectedShopItem(null);
        }
      } catch (error) {
        console.error('Failed to delete shop item:', error);
        // Handle error display (e.g., toast)
        throw error; // Re-throw for runner state
      }
    };
    this.deleteItemRunner.execute(action);
  };

  // --- Methods to trigger modal opening (called by UI) ---
  // These don't need to live in the presenter if the UI manages modal state directly
  // openCreateItemModal() { ... }
  // startEditItem(id: number) { ... }
}
