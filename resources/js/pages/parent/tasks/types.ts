import { RecurrenceType } from '@/components/domain_driven/fields/dd_recurrence_selector';
import { enumToList } from '@/hooks/enums_to_list';

export enum TaskType {
  Routine = 'routine',
  CHALLENGE = 'challenge',
}

export const taskTypeOptions = enumToList(TaskType);

export enum RecurrenceDays {
  MONDAY = 'mon',
  TUESDAY = 'tue',
  WEDNESDAY = 'wed',
  THURSDAY = 'thu',
  FRIDAY = 'fri',
  SATURDAY = 'sat',
  SUNDAY = 'sun',
}

export interface Task {
  id: number;
  title: string;
  description: string;
  type: TaskType;
  needs_approval: boolean;
  is_collaborative: boolean;
  recurrence_type: RecurrenceType;
  recurrence_days: string[];
  start_date: Date;
  recurrence_ends_on: Date | null;
  available_from_time: string;
  available_to_time: string;
  suggested_duration_minutes: number;
  is_active: boolean;
  assigned_children: Child[];
}

export interface Child {
  id: number;
  name: string;
}

export const mockChildren: Child[] = [
  { id: 1, name: 'Emma' },
  { id: 2, name: 'Noah' },
  { id: 3, name: 'Olivia' },
  { id: 4, name: 'Liam' },
];

export const mockTasks: Task[] = [
  {
    id: 1,
    title: 'Make the bed',
    description: 'Straighten sheets, arrange pillows, and smooth out comforter',
    type: TaskType.Routine,
    needs_approval: true,
    is_collaborative: false,
    recurrence_type: RecurrenceType.DAILY,
    recurrence_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    start_date: new Date('2025-04-01'),
    recurrence_ends_on: new Date('2025-05-01'),
    available_from_time: '08:00',
    available_to_time: '10:00',
    suggested_duration_minutes: 5,
    is_active: true,
    assigned_children: [mockChildren[0], mockChildren[2]],
  },
  {
    id: 2,
    title: 'Empty dishwasher',
    description: 'Put away all clean dishes from dishwasher',
    type: TaskType.Routine,
    needs_approval: true,
    is_collaborative: false,
    recurrence_type: RecurrenceType.DAILY,
    recurrence_days: ['Mon', 'Wed', 'Fri'],
    start_date: new Date('2025-04-01'),
    recurrence_ends_on: new Date('2025-05-01'),
    available_from_time: '17:00',
    available_to_time: '20:00',
    suggested_duration_minutes: 10,
    is_active: true,
    assigned_children: [mockChildren[1]],
  },
  {
    id: 3,
    title: 'Weekend room cleanup',
    description: 'Vacuum floor, dust surfaces, and organize toys and books',
    type: TaskType.CHALLENGE,
    needs_approval: true,
    is_collaborative: false,
    recurrence_type: RecurrenceType.DAILY,
    recurrence_days: ['Sat', 'Sun'],
    start_date: new Date('2025-04-05'),
    recurrence_ends_on: new Date('2025-07-01'),
    available_from_time: '10:00',
    available_to_time: '16:00',
    suggested_duration_minutes: 30,
    is_active: true,
    assigned_children: [mockChildren[0], mockChildren[1], mockChildren[2], mockChildren[3]],
  },
  {
    id: 4,
    title: 'Take out trash',
    description: 'Empty all trash bins and take garbage to outdoor bin',
    type: TaskType.Routine,
    needs_approval: true,
    is_collaborative: false,
    recurrence_type: RecurrenceType.DAILY,
    recurrence_days: ['Mon', 'Thu'],
    start_date: new Date('2025-04-01'),
    recurrence_ends_on: new Date('2025-05-01'),
    available_from_time: '17:00',
    available_to_time: '19:00',
    suggested_duration_minutes: 10,
    is_active: true,
    assigned_children: [mockChildren[1], mockChildren[3]],
  },
  {
    id: 5,
    title: 'Math homework help',
    description: 'Help younger sibling with math homework for 20 minutes',
    type: TaskType.CHALLENGE,
    needs_approval: true,
    is_collaborative: true,
    recurrence_type: RecurrenceType.DAILY,
    recurrence_days: ['Tue', 'Thu'],
    start_date: new Date('2025-04-02'),
    recurrence_ends_on: new Date('2025-05-15'),
    available_from_time: '16:00',
    available_to_time: '18:00',
    suggested_duration_minutes: 20,
    is_active: true,
    assigned_children: [mockChildren[2]],
  },
  {
    id: 6,
    title: 'Spring garden planting',
    description: 'Help plant vegetables and flowers in the garden',
    type: TaskType.CHALLENGE,
    needs_approval: true,
    is_collaborative: true,
    recurrence_type: RecurrenceType.DAILY,
    recurrence_days: ['Sat'],
    start_date: new Date('2025-04-15'),
    recurrence_ends_on: new Date('2025-04-15'),
    available_from_time: '09:00',
    available_to_time: '17:00',
    suggested_duration_minutes: 120,
    is_active: true,
    assigned_children: [mockChildren[0], mockChildren[1], mockChildren[2], mockChildren[3]],
  },
  {
    id: 7,
    title: 'Feed pets',
    description: 'Give food and fresh water to all pets',
    type: TaskType.Routine,
    needs_approval: false,
    is_collaborative: false,
    recurrence_type: RecurrenceType.DAILY,
    recurrence_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    start_date: new Date('2025-04-01'),
    recurrence_ends_on: new Date('2025-06-01'),
    available_from_time: '07:00',
    available_to_time: '09:00',
    suggested_duration_minutes: 5,
    is_active: true,
    assigned_children: [mockChildren[0], mockChildren[3]],
  },
  {
    id: 8,
    title: 'Read for 30 minutes',
    description: 'Read a book for at least 30 minutes',
    type: TaskType.Routine,
    needs_approval: false,
    is_collaborative: false,
    recurrence_type: RecurrenceType.DAILY,
    recurrence_days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    start_date: new Date('2025-04-01'),
    recurrence_ends_on: new Date('2025-06-01'),
    available_from_time: '19:00',
    available_to_time: '21:00',
    suggested_duration_minutes: 30,
    is_active: true,
    assigned_children: [mockChildren[0], mockChildren[1], mockChildren[2], mockChildren[3]],
  },
];

// Function to get tasks for a specific child
export const getTasksForChild = (childId: number): Task[] => {
  return mockTasks.filter((task) => task.assigned_children.some((child) => child.id === childId));
};
