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

// { Tasks
//     "id": 5,
//     "user_id": 1,
//     "title": "Morning Exercise",
//     "description": "Do 15 minutes of morning exercise.",
//     "image_path": null,
//     "type": "routine",
//     "needs_approval": false,
//     "is_collaborative": false,
//     "is_mandatory": true,
//     "recurrence_type": "daily",
//     "recurrence_days": [
//         "Mon",
//         "Tue",
//         "Wed",
//         "Thu",
//         "Fri",
//         "Sat",
//         "Sun"
//     ],
//     "start_date": "2025-04-13",
//     "recurrence_ends_on": "2025-06-08",
//     "available_from_time": "07:00",
//     "available_to_time": "07:30",
//     "completion_window_start": null,
//     "completion_window_end": null,
//     "suggested_duration_minutes": 15,
//     "is_active": true,
//     "created_at": "2025-04-13T20:50:15.000000Z",
//     "updated_at": "2025-04-13T20:50:15.000000Z",
//     "assigned_to": Children [
//         {
//             "id": 1,
//             "name": "Golda",
//             "color": "#CAFFBF",
//             "avatar": null,
//             "token_reward": 18
//         }
//     ],
//     "status": "completed",
//     "completed_at": "2025-04-13T22:49:11+00:00",
//     "approved_at": null,
//     "assignment_id": 6
// }
export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  image_path: string | null;
  type: TaskType;
  needs_approval: boolean;
  is_collaborative: boolean;
  is_mandatory: boolean;
  recurrence_type: RecurrenceType;
  recurrence_days: string[];
  start_date: string;
  recurrence_ends_on: string | null;
  available_from_time: string;
  available_to_time: string | null;
  completion_window_start: string | null;
  completion_window_end: string | null;
  suggested_duration_minutes: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  children: Child[];
  status: string;
  completed_at: string | null;
  approved_at: string | null;
  assignment_id: number;
}

export interface Child {
  id: number;
  name: string;
  avatar: string | null;
  color: string;
  token_reward: number;
}

export interface FamilyChild {
  id: number;
  name: string;
  color: string;
  token_balance: number;
}
