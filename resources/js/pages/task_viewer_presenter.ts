import { AsyncActionRunner } from '@/hex/async_action_runner';
import { Child, Task } from '@/types/task';
import axios from 'axios';
import { format } from 'date-fns';

export type ViewMode = 'day' | 'week' | 'month';

export class TaskViewerPresenter {
  tasks: AsyncActionRunner<Task[]>;
  viewMode: ViewMode;
  today: Date;
  currentHour: number;
  familyChildren = new AsyncActionRunner<Child[]>([]); // Add state for children

  constructor() {
    this.tasks = new AsyncActionRunner<Task[]>([]); // In a real app, this would likely be fetched
    this.viewMode = 'day';
    this.today = new Date();
    this.currentHour = this.today.getHours();
  }

  getFormattedDate(): string {
    return format(this.today, 'EEEE, MMMM d, yyyy');
  }

  async getFamilyTasks() {
    this.tasks.execute(async () => {
      const response = await axios.get<Task[]>('/listFamilyTasks');
      // Ensure the response data is correctly typed or mapped to Task[]
      return response.data as Task[];
    });
  }

  // Add method to fetch children
  async getFamilyChildren() {
    this.familyChildren.execute(async () => {
      const response = await axios.get<Child[]>('/listFamilyChildren');
      return response.data;
    });
  }

  setViewMode(mode: ViewMode) {
    if (this.viewMode !== mode) {
      this.viewMode = mode;
    }
  }

  getTasksForDay(day: Date): Task[] {
    const dayOfWeek = day.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Mon", "Tue"

    return this.tasks.getValue().filter((task) => {
      if (!task.start_date || !task.recurrence_ends_on || !task.recurrence_days) {
        return false; // Skip tasks with missing date/recurrence info
      }
      try {
        const taskStartDate = new Date(task.start_date);
        const taskEndDate = new Date(task.recurrence_ends_on);

        // Ensure dates are valid before comparison
        if (isNaN(taskStartDate.getTime()) || isNaN(taskEndDate.getTime())) {
          console.warn(`Invalid date found for task: ${task.title}`);
          return false;
        }

        // Normalize day to start of day for comparison
        const comparisonDay = new Date(day);
        comparisonDay.setHours(0, 0, 0, 0);
        taskStartDate.setHours(0, 0, 0, 0);
        taskEndDate.setHours(0, 0, 0, 0);

        const isInDateRange = comparisonDay >= taskStartDate && comparisonDay <= taskEndDate;
        const matchesRecurrence = task.recurrence_days.includes(dayOfWeek);

        return isInDateRange && matchesRecurrence;
      } catch (error) {
        console.error(`Error processing task ${task.id}:`, error);
        return false;
      }
    });
  }
}
