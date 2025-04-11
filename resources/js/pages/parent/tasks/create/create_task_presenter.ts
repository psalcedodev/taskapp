import { TaskFormDomain } from '../form/task_form_domain';
import { Child, RecurrenceType, Task, TaskType } from '../types';

export class NewTask implements Task {
  id: number;
  title: string;
  description: string;
  token_amount: number;
  type: TaskType;
  needs_approval: boolean;
  is_collaborative: boolean;
  recurrence_type: RecurrenceType;
  recurrence_days: string[];
  start_date: Date;
  recurrence_ends_on: Date;
  assigned_to: Child[];
  available_from_time: string;
  available_to_time: string;
  suggested_duration_minutes: number;
  is_active: boolean;
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
    this.start_date = new Date();
    this.recurrence_ends_on = new Date();
    this.assigned_to = [];
    this.available_from_time = '';
    this.available_to_time = '';
    this.suggested_duration_minutes = 0;
    this.is_active = true;
  }
}

export class CreateTaskPresenter implements CreateTaskPresenterPort {
  onClose: () => void;
  onSuccess: () => void;

  taskFormDomain: TaskFormDomain;
  constructor(onClose: () => void, onSuccess: () => void) {
    this.onClose = onClose;
    this.onSuccess = onSuccess;
    this.taskFormDomain = new TaskFormDomain(new NewTask());
  }
}

export interface CreateTaskPresenterPort {
  taskFormDomain: TaskFormDomain;
  onClose: () => void;
}
