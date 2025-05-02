import { Child, ChildFormData, TokenTransaction } from '../children_types';

export interface ChildrenApiPort {
  listChildren(): Promise<Child[]>;
  createChild(data: ChildFormData): Promise<Child>;
  updateChild(id: number, data: ChildFormData): Promise<Child>;
  deleteChild(id: number): Promise<void>;
  loadTokenHistory(childId: number): Promise<TokenTransaction[]>;
}
