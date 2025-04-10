import { TaskFormDomain } from '../form/task_form_domain';

export class CreateTaskPresenter implements CreateTaskPresenterPort {
  onClose: () => void;
  onSuccess: () => void;

  taskFormDomain: TaskFormDomain;
  constructor(onClose: () => void, onSuccess: () => void) {
    this.onClose = onClose;
    this.onSuccess = onSuccess;
    this.taskFormDomain = new TaskFormDomain();
  }
}

export interface CreateTaskPresenterPort {
  taskFormDomain: TaskFormDomain;
  onClose: () => void;
}
