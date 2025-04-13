import { mockTasks } from '@/pages/parent/tasks/types';
import { Task } from '@/types/task';
import { format } from 'date-fns';

export type ViewMode = 'day' | 'week' | 'month';

export class TaskViewerPresenter {
  tasks: Task[];
  viewMode: ViewMode;
  today: Date;
  currentHour: number;

  constructor() {
    this.tasks = mockTasks; // In a real app, this would likely be fetched
    this.viewMode = 'day';
    this.today = new Date();
    this.currentHour = this.today.getHours();
  }

  getFormattedDate(): string {
    return format(this.today, 'EEEE, MMMM d, yyyy');
  }

  setViewMode(mode: ViewMode) {
    if (this.viewMode !== mode) {
      this.viewMode = mode;
    }
  }

  getTaskHour(timeString: string | null | undefined): number {
    console.log(`Parsing time string: ${timeString}`);
    if (!timeString) return 8; // Default or handle null/undefined case
    const [hours] = timeString.split(':');
    return parseInt(hours, 10);
  }

  getTasksForDay(day: Date): Task[] {
    const dayOfWeek = day.toLocaleDateString('en-US', { weekday: 'short' }); // e.g., "Mon", "Tue"

    return this.tasks.filter((task) => {
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

  getTaskColor(taskType: string): string {
    switch (taskType) {
      case 'routine':
        return 'bg-blue-100 border-blue-200';
      case 'challenge':
        return 'bg-purple-100 border-purple-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  }

  getRandomEmoji(taskTitle: string): string {
    // Simple hash function for variety, but consistent for the same title
    let hash = 0;
    for (let i = 0; i < taskTitle.length; i++) {
      hash = taskTitle.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash; // Convert to 32bit integer
    }
    const emojis = ['📚', '🧹', '🍽️', '🛏️', '🧸', '📱', '🎮', '🧠', '🏃‍♂️', '🥗', '🧼', '📝', '🎵', '✏️', '💡', '🎨', '🏀', '⚽', '🎸', '🧩'];
    const index = Math.abs(hash) % emojis.length;
    return emojis[index];
  }
}
