import { AsyncActionRunner } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import { Task } from '@/types/task';
import { startOfDay } from 'date-fns';
import { FieldDomain } from '../domain_driven/field_domain';

import axios from 'axios';
import { toast } from 'sonner';

export class DayViewPresenter {
  readonly selectedDate: FieldDomain<Date | null>;
  readonly tasksForSelectedDate: ObservableValue<Record<number, Task[]>>;
  readonly hours: number[];
  readonly markCompleteRunner: AsyncActionRunner<void> = new AsyncActionRunner<void>(undefined);

  private _tasks: Task[];
  private _onComplete: () => void;

  constructor(tasks: Task[], onComplete: () => void) {
    this._onComplete = onComplete;
    this._tasks = tasks;
    this.hours = Array.from({ length: 24 }, (_, i) => i);
    this.selectedDate = new FieldDomain<Date | null>('selectedDate', startOfDay(new Date()));
    this.tasksForSelectedDate = new ObservableValue<Record<number, Task[]>>(this._calculateTasksForDate(this.selectedDate.getValue()));
    this.selectedDate.setOnChangeCallback((date) => {
      const newTasks = this._calculateTasksForDate(date.getValue());
      this.tasksForSelectedDate.setValue(newTasks);
    });
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

  private _calculateTasksForDate(date: Date | null): Record<number, Task[]> {
    if (!date) {
      return {};
    }

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
        case 'weekly':
          if (!task.recurrence_days || task.recurrence_days.length === 0) return false;
          const recurrenceDayNumbers = task.recurrence_days.map((day) => dayMap[day]).filter((num) => num !== undefined);
          return recurrenceDayNumbers.includes(selectedDay);
        default:
          return false;
      }
    });

    return this.hours.reduce(
      (hourAcc, hour) => {
        hourAcc[hour] = tasksOnDate.filter((task) => {
          const taskHour = this.getTaskHour(task.available_from_time);
          return taskHour === hour;
        });
        return hourAcc;
      },
      {} as Record<number, Task[]>,
    );
  }

  dispose() {
    this.selectedDate.dispose();
    this.tasksForSelectedDate.dispose();
    this.markCompleteRunner.dispose();
  }
}
