import { AsyncActionRunner } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import { toast } from 'sonner';
import { ChildrenApiPort } from '../adapter/children_api_port';
import { Child, TokenTransaction } from '../children_types';
import { CreateChildPresenter } from '../create/create_child_presenter';

export class ChildrenManagerPresenter {
  // UI state
  selectedChild = new ObservableValue<Child | null>(null);
  createPresenter = new ObservableValue<CreateChildPresenter | null>(null);
  childToDelete = new ObservableValue<Child | null>(null);
  childToEdit = new ObservableValue<Child | null>(null);

  // API runners
  childrenRunner = new AsyncActionRunner<Child[]>([]);
  deleteChildRunner = new AsyncActionRunner<void>(undefined);
  tokenHistoryRunner = new AsyncActionRunner<TokenTransaction[]>([]);

  constructor(private api: ChildrenApiPort) {
    this.listChildren();
  }

  listChildren() {
    this.childrenRunner.execute(() => this.api.listChildren());
  }

  loadTokenHistory(childId: number) {
    this.tokenHistoryRunner.execute(() => this.api.loadTokenHistory(childId));
  }

  // UI actions
  setSelectedChild(child: Child | null) {
    this.selectedChild.setValue(child);
    if (child) {
      this.loadTokenHistory(child.id);
    }
  }

  openCreateModal() {
    this.createPresenter.setValue(
      new CreateChildPresenter(
        this.api,
        () => {
          this.closeCreateModal();
          this.listChildren();
        },
        () => this.closeCreateModal(),
      ),
    );
  }

  closeCreateModal() {
    this.createPresenter.setValue(null);
  }

  startEditChild(child: Child) {
    this.childToEdit.setValue(child);
  }

  stopEditChild() {
    this.childToEdit.setValue(null);
  }

  startDeleteChild(child: Child) {
    this.childToDelete.setValue(child);
  }

  cancelDeleteChild() {
    this.childToDelete.setValue(null);
  }

  confirmDeleteChild() {
    const child = this.childToDelete.getValue();
    if (!child) return;
    this.deleteChildRunner.execute(async () => {
      try {
        await this.api.deleteChild(child.id);
        toast.success(`Child "${child.name}" deleted successfully`);
        this.cancelDeleteChild();
        this.setSelectedChild(null);
        this.listChildren();
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to delete child');
        throw error;
      }
    });
  }

  onSuccessfulEditChild() {
    this.stopEditChild();
    this.setSelectedChild(this.childToEdit.getValue());
    this.listChildren();
  }
}
