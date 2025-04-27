/**
 * Data shape expected by the backend API when creating or updating a Shop Item,
 * aligned with backend request validation.
 */
export interface ShopItemRequestData {
  name: string;
  description: string | null;
  image_path: string | null;
  token_cost: number;
  stock: number;
  needs_approval?: boolean;
  is_limited_time?: boolean;
  available_from?: string | null;
  available_until?: string | null;
  is_active?: boolean;
}
