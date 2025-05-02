import { AsyncActionRunner } from '@/hex/async_action_runner';
import { toast } from 'sonner';
import { ChildrenApiPort } from '../adapter/children_api_port';
import { Child } from '../children_types';
import { ChildFormDomain } from '../form/child_form_domain';
import { ChildMock } from '../mock/child_mock';

export class EditChildPresenter {
  childId: number;
  formDomain: ChildFormDomain;
  updateChildRunner = new AsyncActionRunner<Child | undefined>(undefined);

  constructor(
    private api: ChildrenApiPort,
    child: Child,
    private onSuccess: () => void,
    private onCancel: () => void,
  ) {
    this.childId = child.id;
    this.formDomain = new ChildFormDomain(new ChildMock(child));
  }

  async updateChild() {
    const isValid = await this.formDomain.validate();
    if (!isValid) return;

    const formData = this.formDomain.getFormData();

    this.updateChildRunner.execute(async () => {
      try {
        const updated = await this.api.updateChild(this.childId, formData);
        toast.success('Child updated successfully');
        this.onSuccess();
        return updated;
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to update child');
        throw error;
      }
    });
  }

  cancel() {
    this.onCancel();
  }
}
