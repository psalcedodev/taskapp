import { Child, ChildFormData } from '../children_types';

export class ChildMock implements ChildFormData {
  id: number;
  name: string;
  pin: string;
  token_balance: number;
  color: string;
  avatar_url?: string;

  constructor(child?: Child) {
    this.id = child?.id ?? 1;
    this.name = child?.name ?? 'John Doe';
    this.pin = child?.pin_hash ?? '123456';
    this.token_balance = child?.token_balance ?? 0;
    this.color = child?.color ?? '#000000';
    this.avatar_url = child?.avatar_url ?? undefined;
  }
}

export class NewChild implements ChildFormData {
  name: string;
  pin: string;
  token_balance: number;
  color: string;
  avatar_url?: string;

  constructor() {
    this.name = '';
    this.pin = '';
    this.token_balance = 0;
    this.color = '#000000';
    this.avatar_url = undefined;
  }
}
