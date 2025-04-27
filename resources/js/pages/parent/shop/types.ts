/**
 * Represents a shop item available for purchase by a child, matching backend structure.
 */
export interface ShopItem {
  id: number;
  user_id?: number; // Included from backend model context
  name: string;
  description: string | null;
  image_path: string | null; // URL or path to the item's image
  token_cost: number; // Renamed from 'cost'
  stock: number;
  needs_approval?: boolean;
  is_limited_time?: boolean;
  available_from?: string | null; // ISO 8601 datetime string or null
  available_until?: string | null; // ISO 8601 datetime string or null
  is_active: boolean; // Whether the item is currently available in the shop
  created_at?: string; // ISO 8601 datetime string
  updated_at?: string; // ISO 8601 datetime string
}
