import { AsyncActionRunner } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import axios from 'axios';
import { TaskFormDomain } from '../form/task_form_domain';
import { Task } from '../types';

export class EditTaskPresenter {
  onClose: () => void;
  onSuccess: () => void;

  taskFormDomain: ObservableValue<TaskFormDomain | null> = new ObservableValue<TaskFormDomain | null>(null);
  taskRunner: AsyncActionRunner<Task | null>;

  constructor(taskId: number, onClose: () => void, onSuccess: () => void) {
    this.onClose = onClose;
    this.onSuccess = onSuccess;
    this.taskRunner = new AsyncActionRunner<Task | null>(null);

    this.taskRunner.execute(async () => {
      const data = await axios.get<Task>(route('tasks.show', taskId));
      this.taskFormDomain.setValue(new TaskFormDomain(data.data));
      return data.data;
    });
  }
}
