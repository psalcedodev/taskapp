import { ObservableValue } from '@/hex/observable_value';
import { Task } from '@/types/task';
import { startOfDay } from 'date-fns';
import { FieldDomain } from '../domain_driven/field_domain'; // Adjusted path assuming it's relative

export class DayViewPresenter {
  // Use FieldDomain for selectedDate to leverage its state management
  readonly selectedDate: FieldDomain<Date | null>;
  // Use ObservableValue to hold and notify about changes to the filtered tasks
  readonly tasksForSelectedDate: ObservableValue<Record<number, Task[]>>;
  readonly hours: number[];

  private _tasks: Task[];
  private _getTaskHour: (timeString: string | null | undefined) => number;

  constructor(tasks: Task[], getTaskHour: (timeString: string | null | undefined) => number) {
    this._tasks = tasks;
    this.hours = Array.from({ length: 24 }, (_, i) => i);
    this._getTaskHour = getTaskHour;

    // Use the passed initialDate
    this.selectedDate = new FieldDomain<Date | null>('selectedDate', startOfDay(new Date()));

    // Initialize tasksForSelectedDate as an ObservableValue, calculating the initial state
    this.tasksForSelectedDate = new ObservableValue<Record<number, Task[]>>(this._calculateTasksForDate(this.selectedDate.getValue()));

    // Subscribe to changes in the selectedDate FieldDomain
    this.selectedDate.setOnChangeCallback((date) => {
      console.log({ date: date.getValue() });
      // When the date changes, recalculate the tasks and update the observable
      const newTasks = this._calculateTasksForDate(date.getValue());
      console.log({ newTasks });
      this.tasksForSelectedDate.setValue(newTasks);
    });
  }

  // Private method to calculate tasks for a given date
  private _calculateTasksForDate(date: Date | null): Record<number, Task[]> {
    if (!date) {
      return {}; // Return empty if no date is selected
    }
    return this.hours.reduce(
      (hourAcc, hour) => {
        hourAcc[hour] = this._tasks.filter((task) => {
          // Keep existing filtering logic, using the provided date argument
          if (!task.start_date || !task.recurrence_ends_on || !task.recurrence_days) {
            return false;
          }
          try {
            const taskStartDate = startOfDay(new Date(task.start_date));
            const taskEndDate = startOfDay(new Date(task.recurrence_ends_on));
            console.log({ taskStartDate, taskEndDate, taskStartDateTime: task.start_date, taskEndDateTime: task.recurrence_ends_on });

            if (isNaN(taskStartDate.getTime()) || isNaN(taskEndDate.getTime())) {
              console.warn(`Invalid date found for task: ${task.title}`);
              return false;
            }

            const isInDateRange = date >= taskStartDate && date <= taskEndDate;
            const selectedDayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' });
            const matchesRecurrence = task.recurrence_days.includes(selectedDayOfWeek);
            const taskHour = this._getTaskHour(task.available_from_time);
            const matchesHour = taskHour === hour;

            return isInDateRange && matchesRecurrence && matchesHour;
          } catch (error) {
            return false;
          }
        });
        return hourAcc;
      },
      {} as Record<number, Task[]>,
    );
  }

  // Clean up the subscription when the presenter is no longer needed
  dispose() {
    this.selectedDate.dispose(); // Dispose the FieldDomain
    this.tasksForSelectedDate.dispose(); // Dispose the ObservableValue
  }
}
