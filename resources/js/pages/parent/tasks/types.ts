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
  { label: '12 AM', value: '00:00', id: '1' },
  { label: '1 AM', value: '01:00', id: '2' },
  { label: '2 AM', value: '02:00', id: '3' },
  { label: '3 AM', value: '03:00', id: '4' },
  { label: '4 AM', value: '04:00', id: '5' },
  { label: '5 AM', value: '05:00', id: '6' },
  { label: '6 AM', value: '06:00', id: '7' },
  { label: '7 AM', value: '07:00', id: '8' },
  { label: '8 AM', value: '08:00', id: '9' },
  { label: '9 AM', value: '09:00', id: '10' },
  { label: '10 AM', value: '10:00', id: '11' },
  { label: '11 AM', value: '11:00', id: '12' },
  { label: '12 PM', value: '12:00', id: '13' },
  { label: '1 PM', value: '13:00', id: '14' },
  { label: '2 PM', value: '14:00', id: '15' },
  { label: '3 PM', value: '15:00', id: '16' },
  { label: '4 PM', value: '16:00', id: '17' },
  { label: '5 PM', value: '17:00', id: '18' },
  { label: '6 PM', value: '18:00', id: '19' },
  { label: '7 PM', value: '19:00', id: '20' },
  { label: '8 PM', value: '20:00', id: '21' },
  { label: '9 PM', value: '21:00', id: '22' },
  { label: '10 PM', value: '22:00', id: '23' },
  { label: '11 PM', value: '23:00', id: '24' },
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

export const mockChildren: Child[] = [
  { id: 1, name: 'Emma', tokens: 120 },
  { id: 2, name: 'Noah', tokens: 85 },
  { id: 3, name: 'Olivia', tokens: 200 },
  { id: 4, name: 'Liam', tokens: 75 },
];

export const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Make the bed',
    description: 'Straighten sheets, arrange pillows, and smooth out comforter',
    token_amount: 10,
    type: TaskType.Routine,
    needs_approval: true,
    is_collaborative: false,
    recurrence_type: RecurrenceType.WEEKLY,
    recurrence_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    start_date: new Date('2025-04-01'),
    recurrence_ends_on: new Date('2025-05-01'),
    available_from_time: '08:00',
    available_to_time: '10:00',
    suggested_duration_minutes: 5,
    is_active: true,
    assigned_to: [mockChildren[0], mockChildren[2]],
  },
  {
    id: 2,
    title: 'Empty dishwasher',
    description: 'Put away all clean dishes from dishwasher',
    token_amount: 15,
    type: TaskType.Routine,
    needs_approval: true,
    is_collaborative: false,
    recurrence_type: RecurrenceType.WEEKLY,
    recurrence_days: ['Mon', 'Wed', 'Fri'],
    start_date: new Date('2025-04-01'),
    recurrence_ends_on: new Date('2025-05-01'),
    available_from_time: '17:00',
    available_to_time: '20:00',
    suggested_duration_minutes: 10,
    is_active: true,
    assigned_to: [mockChildren[1]],
  },
  {
    id: 3,
    title: 'Weekend room cleanup',
    description: 'Vacuum floor, dust surfaces, and organize toys and books',
    token_amount: 30,
    type: TaskType.CHALLENGE,
    needs_approval: true,
    is_collaborative: false,
    recurrence_type: RecurrenceType.WEEKLY,
    recurrence_days: ['Sat', 'Sun'],
    start_date: new Date('2025-04-05'),
    recurrence_ends_on: new Date('2025-07-01'),
    available_from_time: '10:00',
    available_to_time: '16:00',
    suggested_duration_minutes: 30,
    is_active: true,
    assigned_to: [mockChildren[0], mockChildren[1], mockChildren[2], mockChildren[3]],
  },
  {
    id: 4,
    title: 'Take out trash',
    description: 'Empty all trash bins and take garbage to outdoor bin',
    token_amount: 15,
    type: TaskType.Routine,
    needs_approval: true,
    is_collaborative: false,
    recurrence_type: RecurrenceType.WEEKLY,
    recurrence_days: ['Mon', 'Thu'],
    start_date: new Date('2025-04-01'),
    recurrence_ends_on: new Date('2025-05-01'),
    available_from_time: '17:00',
    available_to_time: '19:00',
    suggested_duration_minutes: 10,
    is_active: true,
    assigned_to: [mockChildren[1], mockChildren[3]],
  },
  {
    id: 5,
    title: 'Math homework help',
    description: 'Help younger sibling with math homework for 20 minutes',
    token_amount: 25,
    type: TaskType.CHALLENGE,
    needs_approval: true,
    is_collaborative: true,
    recurrence_type: RecurrenceType.WEEKLY,
    recurrence_days: ['Tue', 'Thu'],
    start_date: new Date('2025-04-02'),
    recurrence_ends_on: new Date('2025-05-15'),
    available_from_time: '16:00',
    available_to_time: '18:00',
    suggested_duration_minutes: 20,
    is_active: true,
    assigned_to: [mockChildren[2]],
  },
  {
    id: 6,
    title: 'Spring garden planting',
    description: 'Help plant vegetables and flowers in the garden',
    token_amount: 50,
    type: TaskType.CHALLENGE,
    needs_approval: true,
    is_collaborative: true,
    recurrence_type: RecurrenceType.WEEKLY,
    recurrence_days: ['Sat'],
    start_date: new Date('2025-04-15'),
    recurrence_ends_on: new Date('2025-04-15'),
    available_from_time: '09:00',
    available_to_time: '17:00',
    suggested_duration_minutes: 120,
    is_active: true,
    assigned_to: [mockChildren[0], mockChildren[1], mockChildren[2], mockChildren[3]],
  },
  {
    id: 7,
    title: 'Feed pets',
    description: 'Give food and fresh water to all pets',
    token_amount: 10,
    type: TaskType.Routine,
    needs_approval: false,
    is_collaborative: false,
    recurrence_type: RecurrenceType.WEEKLY,
    recurrence_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    start_date: new Date('2025-04-01'),
    recurrence_ends_on: new Date('2025-06-01'),
    available_from_time: '07:00',
    available_to_time: '09:00',
    suggested_duration_minutes: 5,
    is_active: true,
    assigned_to: [mockChildren[0], mockChildren[3]],
  },
  {
    id: 8,
    title: 'Read for 30 minutes',
    description: 'Read a book for at least 30 minutes',
    token_amount: 20,
    type: TaskType.Routine,
    needs_approval: false,
    is_collaborative: false,
    recurrence_type: RecurrenceType.WEEKLY,
    recurrence_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    start_date: new Date('2025-04-01'),
    recurrence_ends_on: new Date('2025-06-01'),
    available_from_time: '19:00',
    available_to_time: '21:00',
    suggested_duration_minutes: 30,
    is_active: true,
    assigned_to: [mockChildren[0], mockChildren[1], mockChildren[2], mockChildren[3]],
  },
];

// Function to get tasks for a specific child
export const getTasksForChild = (childId: number): Task[] => {
  return mockTasks.filter((task) => task.assigned_to.some((child) => child.id === childId));
};

// Function to get all tasks for today
export const getTodayTasks = (): Task[] => {
  const today = new Date();
  const todayDay = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as RecurrenceDays;

  return mockTasks.filter((task) => {
    // Check if task is within date range
    const isInDateRange = today >= task.start_date && today <= task.recurrence_ends_on;

    // Check recurrence pattern
    let matchesRecurrence = false;
    switch (task.recurrence_type) {
      case RecurrenceType.NONE:
        // For non-recurring tasks, check if today is the start date
        matchesRecurrence = today.toDateString() === task.start_date.toDateString();
        break;
      case RecurrenceType.DAILY:
        matchesRecurrence = true;
        break;
      case RecurrenceType.WEEKLY:
        // For weekly tasks, check if today is one of the recurrence days
        matchesRecurrence = task.recurrence_days.includes(todayDay);
        break;
      case RecurrenceType.MONTHLY:
        // For monthly tasks, check if today's date matches the start date's day of month
        matchesRecurrence = today.getDate() === task.start_date.getDate();
        break;
    }

    return isInDateRange && matchesRecurrence && task.is_active;
  });
};
