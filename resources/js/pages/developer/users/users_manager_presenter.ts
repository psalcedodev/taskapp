import { AsyncActionRunner } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import { User } from '@/types';
import axios from 'axios';
import { CreateUserPresenter } from './create/react/create_user_presenter';

export class UsersManagerPresenter {
  usersRunner: AsyncActionRunner<User[]>;
  selectedUser: ObservableValue<User | null> = new ObservableValue<User | null>(null);

  createUserPresenter: ObservableValue<CreateUserPresenter | null> = new ObservableValue<CreateUserPresenter | null>(null);
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

  setSelectedUser(user: User | null) {
    this.selectedUser.setValue(user);
  }

  openCreateUserModal() {
    this.createUserPresenter.setValue(new CreateUserPresenter(this.closeCreateUserModal.bind(this), this.onSuccessfulCreateUser.bind(this)));
  }
  closeCreateUserModal() {
    this.createUserPresenter.setValue(null);
  }

  onSuccessfulCreateUser() {
    this.listAllUsers();
    this.closeCreateUserModal();
  }
}
