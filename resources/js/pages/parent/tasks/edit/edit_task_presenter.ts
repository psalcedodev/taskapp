import { AsyncActionRunner } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import axios from 'axios';
import { format } from 'date-fns'; // Import date-fns
import { TaskRequestData } from '../form/form_types';
import { TaskFormDomain } from '../form/task_form_domain';
import { Task } from '../types';

// Helper to convert fetched Task (with Date objects) to TaskRequestData shape (with strings/defaults)
// This adapts the fetched data to what the TaskFormDomain constructor expects.
function taskToRequestDataShape(task: Task): TaskRequestData {
  return {
    title: task.title,
    description: task.description ?? '',
    type: task.type,
    needs_approval: task.needs_approval,
    is_collaborative: task.is_collaborative,
    recurrence_type: task.recurrence_type,
    recurrence_days: task.recurrence_days || [],
    start_date: task.start_date ? format(task.start_date, 'yyyy-MM-dd') : null,
    recurrence_ends_on: task.recurrence_ends_on ? format(task.recurrence_ends_on, 'yyyy-MM-dd') : null,
    available_from_time: task.available_from_time,
    available_to_time: task.available_to_time,
    is_active: task.is_active,
    assigned_children:
      task.assigned_children?.map((child) => ({
        ...child,
        token_reward: (child as any).token_reward ?? null,
      })) || [],
    is_mandatory: task.is_mandatory,
  };
}

export class EditTaskPresenter implements EditTaskPresenterPort {
  taskId: number;
  onClose: () => void;
  onSuccess: () => void;

  taskFormDomain: ObservableValue<TaskFormDomain | null> = new ObservableValue<TaskFormDomain | null>(null);
  taskLoadRunner: AsyncActionRunner<Task | null>; // Renamed for clarity
  taskUpdateRunner: AsyncActionRunner<void>; // Added for update

  constructor(taskId: number, onClose: () => void, onSuccess: () => void) {
    this.taskId = taskId;
    this.onClose = onClose;
    this.onSuccess = onSuccess;
    this.taskLoadRunner = new AsyncActionRunner<Task | null>(null);
    this.taskUpdateRunner = new AsyncActionRunner<void>(undefined); // Initialize update runner

    // Fetch initial task data
    this.taskLoadRunner.execute(async () => {
      try {
        const response = await axios.get<Task>(route('tasks.show', this.taskId));
        console.log('response', response);
        const taskDataForDomain = taskToRequestDataShape(response.data);
        this.taskFormDomain.setValue(new TaskFormDomain(taskDataForDomain));
        return response.data;
      } catch (error) {
        console.error('Failed to load task:', error);
        // Optionally handle error display to the user
        this.taskFormDomain.setValue(null); // Ensure domain is null on error
        throw error; // Re-throw to let runner know it failed
      }
    });
  }

  // Method to handle the update action
  async handleUpdate() {
    const domain = this.taskFormDomain.getValue();
    if (!domain) {
      console.error('Form domain not loaded yet.');
      return;
    }

    const isValid = await domain.validate();
    if (!isValid) {
      console.log('Form validation failed.');
      return;
    }

    const requestData = domain.toRequestData();
    console.log('requestData', requestData);

    const action = async () => {
      await axios.put(route('tasks.update', this.taskId), requestData);
      this.onSuccess(); // Call onSuccess callback after successful update
    };

    this.taskUpdateRunner.execute(action);
  }
}

// Define the Port interface for the presenter
export interface EditTaskPresenterPort {
  taskFormDomain: ObservableValue<TaskFormDomain | null>;
  taskLoadRunner: AsyncActionRunner<Task | null>;
  taskUpdateRunner: AsyncActionRunner<void>;
  onClose: () => void;
  handleUpdate: () => void;
}
