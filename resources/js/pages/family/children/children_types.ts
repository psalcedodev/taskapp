export interface Child {
  id: number;
  name: string;
  pin_hash: string;
  token_balance: number;
  avatar_url?: string;
  color: string;
}

export interface ChildFormData {
  name: string;
  pin: string;
  token_balance: number;
  avatar_url?: string;
  color: string;
}

export interface TokenTransaction {
  id: number;
  child_id: number;
  amount: number;
  type: 'task_completion' | 'purchase' | 'adjustment';
  description: string;
  created_at: string;
}
