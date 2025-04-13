export enum TaskType {
  Routine = 'routine',
  CHALLENGE = 'challenge',
}
export enum RecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}
export interface Task {
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
  available_from_time: string;
  available_to_time: string;
  //   completion_window_start: string;
  //   completion_window_end: string;
  suggested_duration_minutes: number;
  is_active: boolean;
  // relationship with assignment and assigment has children
  assigned_to: Child[];
}

export interface Child {
  id: number;
  name: string;
  tokens: number | undefined;
}
