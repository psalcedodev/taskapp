import { ChildOption } from '@/components/domain_driven/fields/child_selection/dd_child_selection';
import { AsyncActionRunner } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import axios from 'axios';
import { CreateTaskPresenter } from './create/create_task_presenter';
import { Child, Task } from './types';

export class TaskManagerPresenter {
  tasksRunner: AsyncActionRunner<Task[]>;
  childrenRunner: AsyncActionRunner<ChildOption[]>;
  selectedTask: ObservableValue<Task | null> = new ObservableValue<Task | null>(null);
  createTaskDomain: ObservableValue<CreateTaskPresenter | null> = new ObservableValue<CreateTaskPresenter | null>(null);
  taskIdToEdit: ObservableValue<number | null>; // Removed taskIdToEdit logic as it is now handled by EditTaskPresenter
  constructor() {
    this.tasksRunner = new AsyncActionRunner<Task[]>([]);
    this.childrenRunner = new AsyncActionRunner<ChildOption[]>([]);
    this.taskIdToEdit = new ObservableValue<number | null>(null);
  }

  listFamilyTasks() {
    this.tasksRunner.execute(async () => {
      const data = await axios.get<Task[]>(route('listFamilyTasks'));
      console.log(data.data);
      return data.data;
    });
  }
  listFamilyChildren() {
    this.childrenRunner.execute(async () => {
      const data = await axios.get<Child[]>(route('listFamilyChildren'));
      return data.data.map((child) => {
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

  openCreateTaskModal() {
    this.createTaskDomain.setValue(new CreateTaskPresenter(this.closeCreateTaskModal.bind(this), this.onSuccessfulCreateTask.bind(this)));
  }

  closeCreateTaskModal() {
    this.createTaskDomain.setValue(null);
  }
  onSuccessfulCreateTask() {
    this.listFamilyTasks();
    this.closeCreateTaskModal();
  }
}
