// Generated from app/Http/Requests/StoreTaskRequest.php

export type TaskRecurrenceType = 'none' | 'daily' | 'weekdays' | 'weekends' | 'custom';
export type TaskType = 'routine' | 'challenge';

export interface AssignedChild {
  id: number; // required, integer, exists:children,id (where user_id matches)
  token_reward?: number | null; // nullable, integer, min:0, required if type is 'challenge'
}

export interface StoreTaskRequestData {
  title: string; // required, string, max:255
  description?: string | null; // nullable, string, max:65535
  image_path?: string | null; // nullable, string, max:2048
  type: TaskType; // required, string, in ['routine', 'challenge']

  needs_approval?: boolean; // sometimes, boolean (defaults to false in prepareForValidation)
  is_collaborative?: boolean; // sometimes, boolean (defaults to false in prepareForValidation)
  is_mandatory?: boolean; // sometimes, boolean (defaults to false in prepareForValidation)

  // Recurrence Rules
  recurrence_type: TaskRecurrenceType; // required, string, in ['none', 'daily', 'weekly', 'monthly', 'custom']
  recurrence_days?: string[] | null; // nullable, array, required if recurrence_type is weekly/monthly/custom
  // recurrence_days.*: string, distinct

  start_date?: string | null; // nullable, date_format:Y-m-d, required if recurrence_type is 'none'
  recurrence_ends_on?: string | null; // nullable, date_format:Y-m-d, after_or_equal:start_date

  available_from_time?: string | null; // nullable, date_format:H:i, required_with:available_to_time
  available_to_time?: string | null; // nullable, date_format:H:i, after:available_from_time

  completion_window_start?: string | null; // nullable, date_format:H:i, required_with:completion_window_end
  completion_window_end?: string | null; // nullable, date_format:H:i, after:completion_window_start

  suggested_duration_minutes?: number | null; // nullable, integer, min:1
  is_active?: boolean; // sometimes, boolean (defaults to true in prepareForValidation)

  assigned_children: AssignedChild[]; // required, array, min:1
}
