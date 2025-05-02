import axios from 'axios';
import { Child, ChildFormData, TokenTransaction } from '../children_types';
import { ChildrenApiPort } from './children_api_port';

export class ChildrenApiAdapter implements ChildrenApiPort {
  async listChildren() {
    const response = await axios.get<Child[]>(route('family.children.list'));
    return response.data;
  }
  async createChild(data: ChildFormData) {
    const response = await axios.post<Child>(route('family.children.store'), data);
    return response.data;
  }
  async updateChild(id: number, data: ChildFormData) {
    const response = await axios.put<Child>(route('family.children.update', id), data);
    return response.data;
  }
  async deleteChild(id: number) {
    await axios.delete(route('family.children.destroy', id));
  }
  async loadTokenHistory(childId: number) {
    const response = await axios.get<TokenTransaction[]>(route('family.children.token-history', childId));
    return response.data;
  }
}
