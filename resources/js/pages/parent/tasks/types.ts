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
  { label: '12 AM', value: '00:00:00', id: '1' },
  { label: '1 AM', value: '01:00:00', id: '2' },
  { label: '2 AM', value: '02:00:00', id: '3' },
  { label: '3 AM', value: '03:00:00', id: '4' },
  { label: '4 AM', value: '04:00:00', id: '5' },
  { label: '5 AM', value: '05:00:00', id: '6' },
  { label: '6 AM', value: '06:00:00', id: '7' },
  { label: '7 AM', value: '07:00:00', id: '8' },
  { label: '8 AM', value: '08:00:00', id: '9' },
  { label: '9 AM', value: '09:00:00', id: '10' },
  { label: '10 AM', value: '10:00:00', id: '11' },
  { label: '11 AM', value: '11:00:00', id: '12' },
  { label: '12 PM', value: '12:00:00', id: '13' },
  { label: '1 PM', value: '13:00:00', id: '14' },
  { label: '2 PM', value: '14:00:00', id: '15' },
  { label: '3 PM', value: '15:00:00', id: '16' },
  { label: '4 PM', value: '16:00:00', id: '17' },
  { label: '5 PM', value: '17:00:00', id: '18' },
  { label: '6 PM', value: '18:00:00', id: '19' },
  { label: '7 PM', value: '19:00:00', id: '20' },
  { label: '8 PM', value: '20:00:00', id: '21' },
  { label: '9 PM', value: '21:00:00', id: '22' },
  { label: '10 PM', value: '22:00:00', id: '23' },
  { label: '11 PM', value: '23:00:00', id: '24' },
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
