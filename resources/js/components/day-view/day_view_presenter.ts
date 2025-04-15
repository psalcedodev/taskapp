import { AsyncActionRunner } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import { TaskAssignment } from '@/pages/task_viewer_presenter';
import { Child, Task } from '@/types/task';
import { startOfDay } from 'date-fns';
import { FieldDomain } from '../domain_driven/field_domain';

import axios from 'axios';
import { toast } from 'sonner';

// Extend Task type locally to include assignment status
export interface TaskWithAssignment extends Task {
  assignment_status?: string; // Status from the assignment for the specific date
}

export class DayViewPresenter {
  readonly selectedDate: FieldDomain<Date | null>;
  readonly selectedChildId: ObservableValue<number | 'all'>;
  readonly tasksForSelectedDate: ObservableValue<Record<number, TaskWithAssignment[]>>;
  readonly hours: number[];
  readonly markCompleteRunner: AsyncActionRunner<void> = new AsyncActionRunner<void>(undefined);
  private _tasks: Task[];
  private _assignments: TaskAssignment[];
  private _onComplete: () => void;

  constructor(tasks: Task[], assignments: TaskAssignment[], selectedChildIdObservable: ObservableValue<number | 'all'>, onComplete: () => void) {
    this._onComplete = onComplete;
    this._tasks = tasks;
    this._assignments = assignments;
    this.selectedChildId = selectedChildIdObservable;
    this.hours = Array.from({ length: 24 }, (_, i) => i);
    this.selectedDate = new FieldDomain<Date | null>('selectedDate', startOfDay(new Date()));
    this.tasksForSelectedDate = new ObservableValue<Record<number, TaskWithAssignment[]>>(this.calculateTasksForDate(this.selectedDate.getValue()));
  }

  /**
   * Updates the internal list of tasks and assignments, then recalculates the tasks for the selected date.
   * Also ensures the child filter observable is connected.
   */
  updateTasksAndAssignments(
    tasks: Task[],
    assignments: TaskAssignment[],
    selectedChildIdObservable: ObservableValue<number | 'all'>,
    selectedDate: Date | null,
  ) {
    this._tasks = tasks;
    this._assignments = assignments;
    this.setTasksForSelectedDate(selectedDate);
  }

  /**
   * Calls the API to mark a task instance as complete or pending approval.
   * @param childId The ID of the child completing the task.
   * @param taskId The ID of the task definition.
   * @param assignedDate The specific date the task instance is for.
   */
  markTaskComplete = (childrenIds: number[], taskId: number) => {
    const action = async () => {
      await axios
        .post<string>(route('task-assignments.complete'), {
          child_ids: childrenIds,
          task_id: taskId,
        })
        .then((res) => {
          console.log({ res });
          this._onComplete();
          toast.success('Task marked as complete');
        })
        .catch((error) => {
          console.log({ error });
          toast.error(error.response.data.message);
        });
    };
    this.markCompleteRunner.execute(action);
  };

  private getTaskHour(timeString: string | null | undefined): number {
    if (!timeString) return 8;
    const [hours] = timeString.split(':');
    return parseInt(hours, 10);
  }

  private getTaskAssignmentStatus(taskId: number, children: Child[], date: Date): string | undefined {
    if (!date) return undefined;

    console.log({ taskId, children, date, assignments: this._assignments });

    const relevantAssignments = this._assignments.filter((a) => a.task_id === taskId && children.some((child) => child.id === a.child_id));

    console.log({ relevantAssignments });

    if (relevantAssignments.length === 0) {
      return 'pending'; // Default if no specific assignment found for this child/task/date
    }

    // Determine combined status (e.g., if one child completed, is it 'in_progress' or 'completed'?)
    // This logic might need refinement based on how collaborative tasks should behave.
    const statuses = new Set(relevantAssignments.map((a) => a.status));

    if (statuses.has('completed') || statuses.has('approved')) {
      // If any relevant assignment is done, consider it done (adjust if needed)
      return 'completed';
    }
    if (statuses.has('in_progress')) {
      return 'in_progress';
    }
    if (statuses.has('pending_approval')) {
      return 'pending_approval';
    }
    if (statuses.has('rejected')) {
      return 'rejected';
    }

    return 'pending'; // Fallback
  }

  calculateTasksForDate(date: Date | null): Record<number, TaskWithAssignment[]> {
    const currentChildId = this.selectedChildId.getValue(); // Get current filter value
    console.log(`Calculating tasks for date: ${date}, Child Filter: ${currentChildId}`);

    if (!date) {
      return {};
    }

    // 1. Filter tasks by date recurrence
    const tasksOnDate = this._tasks.filter((task) => {
      if (!task.recurrence_type) return false;
      const selectedDay = date.getDay();
      const dayMap: { [key: string]: number } = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      const taskStartDate = task.start_date ? startOfDay(new Date(task.start_date)) : null;
      const taskEndDate = task.recurrence_ends_on ? startOfDay(new Date(task.recurrence_ends_on)) : null;
      if (!taskStartDate || isNaN(taskStartDate.getTime())) return false;
      if (date < taskStartDate) return false;
      if (taskEndDate && !isNaN(taskEndDate.getTime()) && date > taskEndDate) return false;
      switch (task.recurrence_type) {
        case 'none':
          return date.getTime() === taskStartDate.getTime();
        case 'daily':
          return true;
        case 'weekly': {
          if (!task.recurrence_days || task.recurrence_days.length === 0) return false;
          const recurrenceDayNumbers = task.recurrence_days.map((day) => dayMap[day]).filter((num) => num !== undefined);
          return recurrenceDayNumbers.includes(selectedDay);
        }
        default:
          return false;
      }
    });

    // 2. Filter tasks by selected child
    const tasksFilteredByChild = tasksOnDate.filter((task) => {
      if (currentChildId === 'all') {
        return true; // Show all tasks if filter is 'all'
      }
      // Show task if the selected child is assigned to it
      return task.children.some((child) => child.id === currentChildId);
    });

    // 3. Group tasks by hour and add assignment status (use tasksFilteredByChild)
    const data = this.hours.reduce(
      (hourAcc, hour) => {
        hourAcc[hour] = tasksFilteredByChild
          .filter((task) => {
            const taskHour = this.getTaskHour(task.available_from_time);
            return taskHour === hour;
          })
          .map((task) => ({
            ...task,
            assignment_status: this.getTaskAssignmentStatus(task.id, task.children, date),
          }));
        return hourAcc;
      },
      {} as Record<number, TaskWithAssignment[]>,
    );

    console.log({ data });

    return data;
  }

  setTasksForSelectedDate(date: Date | null) {
    const tasks = this.calculateTasksForDate(date);
    this.tasksForSelectedDate.setValue(tasks);
  }

  dispose() {
    this.selectedDate.dispose();
    this.tasksForSelectedDate.dispose();
    this.markCompleteRunner.dispose();
  }
}
