import { AsyncActionRunner } from '@/hex/async_action_runner';
import axios from 'axios';
import { toast } from 'sonner';
import { UserFormPresenter } from '../form/user_form_presenter';

export class CreateUserPresenter {
  createRunner: AsyncActionRunner<void>;
  formPresenter: UserFormPresenter;
  onClose: () => void;
  onSuccess: () => void;
  constructor(onClose: () => void, onSuccess: () => void) {
    this.onClose = onClose;
    this.onSuccess = onSuccess;
    this.formPresenter = new UserFormPresenter();
    this.createRunner = new AsyncActionRunner<void>(undefined);
  }

  async handleSubmit() {
    const values = this.formPresenter.getValues();
    const isValid = await this.formPresenter.isValid();
    const isPristine = this.formPresenter.isPristine();
    if (!isValid || isPristine) {
      return;
    }
    await this.createRunner.execute(async () => {
      await axios
        .post<void>(route('register-user'), values)
        .then(() => {
          toast.success('User created successfully');
          this.onSuccess();
        })
        .catch((error) => {
          toast.error('Error creating user: ' + error.response.data.message);
        });
    });
  }
}
