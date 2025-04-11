import { Option } from '@/components/domain_driven/fields/select/dd_select_field';
import { enumToList } from '@/hooks/enums_to_list';
// {
//     "id": 11,
//     "user_id": 3,
//     "title": "Culpa iure dolorem suscipit quisquam.",
//     "description": null,
//     "image_path": null,
//     "token_amount": 0,
//     "type": "quest",
//     "needs_approval": false,
//     "is_collaborative": false,
//     "is_mandatory": false,
//     "recurrence_type": "none",
//     "recurrence_days": null,
//     "start_date": "2025-04-06T00:00:00.000000Z",
//     "recurrence_ends_on": null,
//     "available_from_time": "17:28:00",
//     "available_to_time": null,
//     "completion_window_start": null,
//     "completion_window_end": null,
//     "suggested_duration_minutes": 8,
//     "is_active": true,
//     "created_at": "2025-04-02T04:58:33.000000Z",
//     "updated_at": "2025-04-02T04:58:33.000000Z"
// }

export enum TaskType {
  Routine = 'routine',
  CHALLENGE = 'challenge',
}

export const taskTypeOptions = enumToList(TaskType);

export enum RecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export const recurrenceTypeOptions = enumToList(RecurrenceType);

export enum RecurrenceDays {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

export const recurrenceDaysOptions = enumToList(RecurrenceDays);

export const timeOptions: Option<string>[] = [
  { label: '00:00:00', value: '00:00:00', id: '1' },
  { label: '01:00:00', value: '01:00:00', id: '2' },
  { label: '02:00:00', value: '02:00:00', id: '3' },
  { label: '03:00:00', value: '03:00:00', id: '4' },
  { label: '04:00:00', value: '04:00:00', id: '5' },
  { label: '05:00:00', value: '05:00:00', id: '6' },
  { label: '06:00:00', value: '06:00:00', id: '7' },
  { label: '07:00:00', value: '07:00:00', id: '8' },
  { label: '08:00:00', value: '08:00:00', id: '9' },
  { label: '09:00:00', value: '09:00:00', id: '10' },
  { label: '10:00:00', value: '10:00:00', id: '11' },
  { label: '11:00:00', value: '11:00:00', id: '12' },
  { label: '12:00:00', value: '12:00:00', id: '13' },
  { label: '13:00:00', value: '13:00:00', id: '14' },
  { label: '14:00:00', value: '14:00:00', id: '15' },
  { label: '15:00:00', value: '15:00:00', id: '16' },
  { label: '16:00:00', value: '16:00:00', id: '17' },
  { label: '17:00:00', value: '17:00:00', id: '18' },
  { label: '18:00:00', value: '18:00:00', id: '19' },
  { label: '19:00:00', value: '19:00:00', id: '20' },
  { label: '20:00:00', value: '20:00:00', id: '21' },
  { label: '21:00:00', value: '21:00:00', id: '22' },
  { label: '22:00:00', value: '22:00:00', id: '23' },
  { label: '23:00:00', value: '23:00:00', id: '24' },
];

export const nullableOption: Option<string | null> = { label: 'None', value: null, id: '-1' };

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
