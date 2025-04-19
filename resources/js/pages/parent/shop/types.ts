// Define the structure for a Shop Item
export interface ShopItem {
  id: number;
  name: string;
  description?: string | null;
  token_cost: number;
  stock?: number | null; // Use null for unlimited stock
  is_active: boolean;
  image_url?: string | null; // Optional image
  created_at: string; // ISO Date string
  updated_at: string; // ISO Date string
  // Add any other relevant fields from your ShopItem model
}
