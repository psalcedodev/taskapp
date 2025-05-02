import { AsyncActionRunner } from '@/hex/async_action_runner';
import { toast } from 'sonner';
import { ChildrenApiPort } from '../adapter/children_api_port';
import { Child } from '../children_types';
import { ChildFormDomain } from '../form/child_form_domain';
import { NewChild } from '../mock/child_mock';

export class CreateChildPresenter {
  formDomain: ChildFormDomain;
  createChildRunner = new AsyncActionRunner<Child | undefined>(undefined);

  constructor(
    private api: ChildrenApiPort,
    private onSuccess: () => void,
    private onCancel: () => void,
  ) {
    this.formDomain = new ChildFormDomain(new NewChild());
  }

  async createChild() {
    const isValid = await this.formDomain.validate();
    if (!isValid) return;

    const formData = this.formDomain.getFormData();

    this.createChildRunner.execute(async () => {
      try {
        const child = await this.api.createChild(formData);
        toast.success('Child created successfully');
        this.onSuccess();
        return child;
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to create child');
        throw error;
      }
    });
  }

  cancel() {
    this.onCancel();
  }
}
