import { AsyncActionRunner } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import axios from 'axios';
import { format, isSameDay } from 'date-fns';
import { toast } from 'sonner';
import { FormattedTask } from './types';

export type HourlyTasksResponse = {
  hourlyTasks: Record<number, FormattedTask[]>;
  anytimeTasks: FormattedTask[];
};

export class DayViewPresenter {
  readonly selectedChildId: ObservableValue<number | 'all'>;
  readonly tasksForDateRunner = new AsyncActionRunner<HourlyTasksResponse>({ hourlyTasks: {}, anytimeTasks: [] });
  private readonly _rawHourlyData = new ObservableValue<HourlyTasksResponse>({ hourlyTasks: {}, anytimeTasks: [] });
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
    const filteredHourlyData: HourlyTasksResponse = { hourlyTasks: {}, anytimeTasks: [] };

    // Filter hourlyTasks
    for (const hour of Object.keys(hourlyData.hourlyTasks)) {
      const hourNum = Number(hour);
      const tasks = hourlyData.hourlyTasks[hourNum];
      if (!Array.isArray(tasks) || tasks.length === 0) {
        continue;
      }
      let filteredTasks: FormattedTask[];
      if (currentChildId === 'all') {
        filteredTasks = tasks;
      } else {
        filteredTasks = tasks.filter((task: FormattedTask) => task.children.some((child: any) => child.id === currentChildId));
      }
      if (filteredTasks.length > 0) {
        filteredHourlyData.hourlyTasks[hourNum] = filteredTasks;
      }
    }

    // Filter anytimeTasks
    if (Array.isArray(hourlyData.anytimeTasks)) {
      if (currentChildId === 'all') {
        filteredHourlyData.anytimeTasks = hourlyData.anytimeTasks;
      } else {
        filteredHourlyData.anytimeTasks = hourlyData.anytimeTasks.filter((task: FormattedTask) =>
          task.children.some((child: any) => child.id === currentChildId),
        );
      }
    }

    return filteredHourlyData;
  }

  get tasksForSelectedDate(): AsyncActionRunner<HourlyTasksResponse> {
    return this.tasksForDateRunner;
  }

  fetchTasksForDate(date: Date | null) {
    if (!date) {
      this.tasksForDateRunner.setValue({ hourlyTasks: {}, anytimeTasks: [] });
      this._rawHourlyData.setValue({ hourlyTasks: {}, anytimeTasks: [] });
      this.currentDate = null;
      return;
    }
    this.currentDate = date;
    const formattedDate = format(date, 'yyyy-MM-dd');

    const action = async () => {
      const response = await axios.get<HourlyTasksResponse>(route('tasks.family.list'), {
        params: { date: formattedDate },
      });
      console.log({ tasksall: response.data });
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
