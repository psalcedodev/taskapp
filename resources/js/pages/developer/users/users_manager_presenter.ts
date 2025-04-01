import { AsyncActionRunner } from '@/hex/async_action_runner';
import { User } from '@/types';
import axios from 'axios';

export class UsersManagerPresenter implements UsersManagerPresenterPort {
  usersRunner: AsyncActionRunner<User[]>;
  constructor() {
    this.usersRunner = new AsyncActionRunner<User[]>([]);
    this.listAllUsers();
  }

  async listAllUsers() {
    this.usersRunner.execute(async () => {
      const data = await axios.get<User[]>(route('listAllUsers'));
      return data.data;
    });
  }
}

export interface UsersManagerPresenterPort {}
