import { FieldDomain } from '@/components/domain_driven/field_domain';
import { ChildOption } from '@/components/domain_driven/fields/child_selection/dd_child_selection';
import { AsyncActionRunner } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import axios from 'axios';
import { toast } from 'sonner';
import { CreateTaskPresenter } from './create/create_task_presenter';
import { Child, Task } from './types';

export class TaskManagerPresenter {
  tasksRunner: AsyncActionRunner<Task[]>;
  childrenRunner: AsyncActionRunner<ChildOption[]>;
  selectedTask: ObservableValue<Task | null> = new ObservableValue<Task | null>(null);
  createTaskDomain: ObservableValue<CreateTaskPresenter | null> = new ObservableValue<CreateTaskPresenter | null>(null);
  taskIdToEdit: ObservableValue<number | null>;
  taskToDelete: ObservableValue<Task | null> = new ObservableValue<Task | null>(null);
  deleteTaskRunner: AsyncActionRunner<void>;
  available_from_time: FieldDomain<string> = new FieldDomain<string>('available_from_time', '12:00');
  constructor() {
    this.tasksRunner = new AsyncActionRunner<Task[]>([]);
    this.childrenRunner = new AsyncActionRunner<ChildOption[]>([]);
    this.taskIdToEdit = new ObservableValue<number | null>(null);
    this.deleteTaskRunner = new AsyncActionRunner<void>(undefined);
  }

  initialize() {
    this.listTaskDefinitions();
    this.listFamilyChildren();
  }

  listTaskDefinitions() {
    this.tasksRunner.execute(async () => {
      const response = await axios.get<Task[]>(route('tasks.definitions.list'));
      console.log('Fetched Task Definitions:', response.data);
      return response.data;
    });
  }

  listFamilyChildren() {
    this.childrenRunner.execute(async () => {
      const response = await axios.get<Child[]>(route('family.children.list'));
      return response.data.map((child) => {
        return {
          id: child.id.toString(),
          value: {
            child_id: child.id,
            tokens: 0,
          },
          label: child.name,
        };
      });
    });
  }

  setSelectedTask(task: Task | null) {
    this.selectedTask.setValue(task);
  }

  startEditTask(id: number) {
    this.taskIdToEdit.setValue(id);
  }

  stopEditTask() {
    this.taskIdToEdit.setValue(null);
  }

  startDeleteTask(task: Task) {
    this.taskToDelete.setValue(task);
  }

  cancelDeleteTask() {
    this.taskToDelete.setValue(null);
  }

  confirmDeleteTask() {
    const task = this.taskToDelete.getValue();
    if (!task) return;

    this.deleteTaskRunner.execute(async () => {
      try {
        await axios.delete(route('tasks.destroy', task.id));
        toast.success(`Task "${task.title}" deleted successfully.`);
        this.taskToDelete.setValue(null);
        this.setSelectedTask(null);
        this.listTaskDefinitions();
      } catch (error: any) {
        console.error('Failed to delete task:', error);
        const message = error.response?.data?.message || 'Failed to delete task.';
        toast.error(message);
      }
    });
  }

  openCreateTaskModal() {
    this.createTaskDomain.setValue(new CreateTaskPresenter(this.closeCreateTaskModal.bind(this), this.onSuccessfulCreateTask.bind(this)));
  }

  closeCreateTaskModal() {
    this.createTaskDomain.setValue(null);
  }

  onSuccessfulCreateTask() {
    this.listTaskDefinitions();
    this.closeCreateTaskModal();
  }

  onSuccessfulEditTask() {
    this.listTaskDefinitions();
    this.stopEditTask();
  }
}
