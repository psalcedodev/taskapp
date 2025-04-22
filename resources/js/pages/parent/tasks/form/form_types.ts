import { RecurrenceType } from '@/components/domain_driven/fields/dd_recurrence_selector';

export interface AssignedChild {
  id: number; // required, integer, exists:children,id (where user_id matches)
  name: string; // required, string, max:255
  token_reward: number; // nullable, integer, min:0, required if type is 'challenge'
}

export enum TaskType {
  Routine = 'routine',
  CHALLENGE = 'challenge',
}
export interface TaskRequestData {
  title: string; // required, string, max:255
  description: string; // nullable, string, max:65535
  type: TaskType; // required, string, in ['routine', 'challenge']

  needs_approval: boolean; // sometimes, boolean (defaults to false in prepareForValidation)
  is_collaborative: boolean; // sometimes, boolean (defaults to false in prepareForValidation)
  // For Future Usage:
  //is_mandatory: boolean; // sometimes, boolean (defaults to false in prepareForValidation)

  // Recurrence Rules
  recurrence_type: RecurrenceType; // required, string, in ['none', 'daily', 'weekly', 'monthly', 'custom']
  recurrence_days: string[]; // nullable, array, required if recurrence_type is weekly/monthly/custom
  // recurrence_days.*: string, distinct

  start_date: string | null; // nullable, date_format:Y-m-d, required if recurrence_type is 'none'
  recurrence_ends_on: string | null; // nullable, date_format:Y-m-d, after_or_equal:start_date

  available_from_time: string | null; // nullable, date_format:H:i, required_with:available_to_time
  available_to_time: string | null; // nullable, date_format:H:i, after:available_from_time

  //   completion_window_start?: string; // nullable, date_format:H:i, required_with:completion_window_end
  //   completion_window_end?: string; // nullable, date_format:H:i, after:completion_window_start

  //   suggested_duration_minutes: number; // nullable, integer, min:1
  is_active: boolean; // sometimes, boolean (defaults to true in prepareForValidation)
  assigned_children: AssignedChild[]; // required, array, min:1
}
