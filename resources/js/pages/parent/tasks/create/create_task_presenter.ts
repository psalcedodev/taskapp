import { RecurrenceType } from '@/components/domain_driven/fields/dd_recurrence_selector';
import { AsyncActionRunner } from '@/hex/async_action_runner';
import axios from 'axios';
import { toast } from 'sonner';
import { AssignedChild, TaskRequestData } from '../form/form_types';
import { TaskFormDomain } from '../form/task_form_domain';
import { TaskType } from '../types';

export class NewTask implements TaskRequestData {
  id: number;
  title: string;
  description: string;
  token_amount: number;
  type: TaskType;
  needs_approval: boolean;
  is_collaborative: boolean;
  recurrence_type: RecurrenceType;
  recurrence_days: string[];
  start_date: string | null;
  recurrence_ends_on: string | null;
  assigned_children: AssignedChild[];
  available_from_time: string | null;
  available_to_time: string | null;
  suggested_duration_minutes: number;
  is_active: boolean;
  is_mandatory: boolean;
  constructor() {
    this.id = 0;
    this.title = '';
    this.description = '';
    this.token_amount = 0;
    this.type = TaskType.Routine;
    this.needs_approval = false;
    this.is_collaborative = false;
    this.recurrence_type = RecurrenceType.NONE;
    this.recurrence_days = [];
    this.start_date = null;
    this.recurrence_ends_on = null;
    this.assigned_children = [];
    this.available_from_time = null;
    this.available_to_time = null;
    this.suggested_duration_minutes = 0;
    this.is_active = true;
    this.is_mandatory = false;
  }
}

export class CreateTaskPresenter implements CreateTaskPresenterPort {
  onClose: () => void;
  onSuccess: () => void;

  taskFormDomain: TaskFormDomain;
  taskCreateRunner: AsyncActionRunner<void>;
  constructor(onClose: () => void, onSuccess: () => void) {
    this.onClose = onClose;
    this.onSuccess = onSuccess;
    this.taskFormDomain = new TaskFormDomain(new NewTask());
    this.taskCreateRunner = new AsyncActionRunner<void>(undefined);
  }

  async handleCreate() {
    const isValid = await this.taskFormDomain.validate();
    const isPristine = this.taskFormDomain.isPristine();
    console.log({ isValid, isPristine });
    if (!isValid || isPristine) {
      return;
    }
    const task = this.taskFormDomain.toRequestData();
    const action = async () => {
      await axios.post(route('tasks.store'), task);
    };
    this.taskCreateRunner
      .execute(action)
      .then(() => {
        toast.success('Task created successfully');
        this.onSuccess();
      })
      .catch((e) => {
        toast.error(`Failed to create task: ${e.response.data.message}`);
      });
  }
}

export interface CreateTaskPresenterPort {
  taskFormDomain: TaskFormDomain;
  onClose: () => void;
  handleCreate: () => void;
  taskCreateRunner: AsyncActionRunner<void>;
}
