import { AsyncActionRunner } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import axios from 'axios';
import { format, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import { FormattedTask } from './types';

// Define the overall structure returned by the API
export type HourlyTasksResponse = Record<number, FormattedTask[]>;

export class DayViewPresenter {
  readonly selectedChildId: ObservableValue<number | 'all'>;
  readonly tasksForDateRunner = new AsyncActionRunner<HourlyTasksResponse>({});
  private readonly _rawHourlyData = new ObservableValue<HourlyTasksResponse>({});
  private currentDate: Date | null = null;
  readonly selectedDateObservable: ObservableValue<Date>;

  readonly hours: number[];
  readonly markCompleteRunner: AsyncActionRunner<void> = new AsyncActionRunner<void>(undefined);

  constructor(selectedDateObservable: ObservableValue<Date>, selectedChildIdObservable: ObservableValue<number | 'all'>) {
    this.selectedDateObservable = selectedDateObservable;
    this.selectedChildId = selectedChildIdObservable;

    selectedChildIdObservable.onChange(() => {
      this.handleFilterOrDataChange();
    });

    selectedDateObservable.onChange((newDate) => {
      this.handleDateChange(newDate);
    });

    this.hours = Array.from({ length: 24 }, (_, i) => i);

    // Initial fetch
    this.fetchTasksForDate(this.selectedDateObservable.getValue());
  }

  private handleDateChange = (newDate: Date) => {
    if (!this.currentDate || !isSameDay(newDate, this.currentDate)) {
      this.fetchTasksForDate(newDate);
    }
  };

  private handleFilterOrDataChange = () => {
    const rawData = this._rawHourlyData.getValue();

    const filteredData = this.applyChildFilter(rawData);
    this.tasksForDateRunner.setValue(filteredData);
  };

  private applyChildFilter(hourlyData: HourlyTasksResponse): HourlyTasksResponse {
    const currentChildId = this.selectedChildId.getValue();
    const filteredHourlyData: HourlyTasksResponse = {};

    for (const hour in hourlyData) {
      if (Object.prototype.hasOwnProperty.call(hourlyData, hour)) {
        const tasks = hourlyData[hour];
        // Skip if the raw data for this hour is already an empty array
        if (!Array.isArray(tasks) || tasks.length === 0) {
          continue;
        }

        let filteredTasks: FormattedTask[];

        if (currentChildId === 'all') {
          // If filter is 'all', just use the original tasks (we already checked for empty array)
          filteredTasks = tasks;
        } else {
          // Otherwise, apply the specific child filter
          filteredTasks = tasks.filter((task) => task.children.some((child) => child.id === currentChildId));
        }

        // Only add the hour to the result if there are tasks after potential filtering
        if (filteredTasks.length > 0) {
          filteredHourlyData[hour] = filteredTasks;
        }
      }
    }
    return filteredHourlyData;
  }

  get tasksForSelectedDate(): AsyncActionRunner<HourlyTasksResponse> {
    return this.tasksForDateRunner;
  }

  fetchTasksForDate(date: Date | null) {
    if (!date) {
      this.tasksForDateRunner.setValue({});
      this._rawHourlyData.setValue({});
      this.currentDate = null;
      return;
    }
    this.currentDate = date;
    const formattedDate = format(date, 'yyyy-MM-dd');

    const action = async () => {
      const response = await axios.get<HourlyTasksResponse>(route('tasks.family.list'), {
        params: { date: formattedDate },
      });
      const filteredData = this.applyChildFilter(response.data);
      this._rawHourlyData.setValue(response.data);
      return filteredData;
    };

    this.tasksForDateRunner.execute(action);
  }

  markTaskComplete = (childrenIds: number[], taskId: number, onSuccess?: () => void) => {
    const action = async () => {
      await axios
        .post<{ message: string; status: string }>(route('task-assignments.complete'), {
          child_ids: childrenIds,
          task_id: taskId,
        })
        .then((res) => {
          const { message, status } = res.data;
          onSuccess?.();
          if (status === 'pending_approval') {
            toast.warning(message);
          } else {
            toast.success(message);
          }
          if (this.currentDate) {
            this.fetchTasksForDate(this.currentDate);
          }
        })
        .catch((error) => {
          let message = 'Failed to mark task complete.';
          if (error.response?.data?.message) {
            message = error.response.data.message;
          } else if (error.response?.status === 409) {
            message = 'Task already submitted or approved.';
          }
          toast.error(message);
        });
    };
    this.markCompleteRunner.execute(action);
  };

  dispose() {
    // Call unsubscribe functions if they exist
    this._rawHourlyData.dispose();
    this.tasksForDateRunner.dispose();
    this.markCompleteRunner.dispose();
  }
}
