import { DayViewPresenter } from '@/components/day-view/day_view_presenter';
import { AsyncActionRunner } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import { Child, Task } from '@/types/task';
import axios from 'axios';
import { addDays, format, startOfDay } from 'date-fns';

export type ViewMode = 'day' | 'week' | 'month';

export interface TaskAssignment {
  id: number;
  task_id: number;
  child_id: number;
  status: string;
  assigned_date: string;
  completed_at: string | null;
  approved_at: string | null;
  task: {
    id: number;
    title: string;
    type: string;
    needs_approval: boolean;
    is_collaborative: boolean;
  };
  child: {
    id: number;
    name: string;
    avatar: string | null;
    color: string;
  };
}

export class TaskViewerPresenter {
  tasks: AsyncActionRunner<Task[]>;
  viewMode: ViewMode;
  today: Date;
  currentHour: number;
  familyChildren = new AsyncActionRunner<Child[]>([]);
  selectedDate = new ObservableValue<Date>(new Date());
  selectedChildId = new ObservableValue<number | 'all'>('all');
  taskAssignments = new AsyncActionRunner<TaskAssignment[]>([]);

  dayViewPresenter: ObservableValue<DayViewPresenter | null>;

  constructor() {
    this.tasks = new AsyncActionRunner<Task[]>([]);
    this.viewMode = 'day';
    this.today = new Date();
    this.currentHour = this.today.getHours();
    this.dayViewPresenter = new ObservableValue<DayViewPresenter | null>(null);
  }

  getFormattedDate(): string {
    return format(this.today, 'EEEE, MMMM d, yyyy');
  }

  async getFamilyTasks() {
    this.tasks
      .execute(async () => {
        const response = await axios.get<Task[]>('/listFamilyTasks');
        console.log({ tasks: response.data });
        return response.data as Task[];
      })
      .then(() => this.getTaskAssignmentsForDate(this.selectedDate.getValue()));
  }

  setDayViewPresenter(assignments?: TaskAssignment[]) {
    const currentAssignments = assignments || this.taskAssignments.getValue();
    const dayViewPresenter = this.dayViewPresenter.getValue();

    if (!dayViewPresenter) {
      this.dayViewPresenter.setValue(
        new DayViewPresenter(this.tasks.getValue(), currentAssignments, this.selectedChildId, () => this.getFamilyTasks()),
      );
    } else {
      dayViewPresenter.updateTasksAndAssignments(this.tasks.getValue(), currentAssignments, this.selectedChildId, this.selectedDate.getValue());
    }
  }

  async getFamilyChildren() {
    this.familyChildren.execute(async () => {
      const response = await axios.get<Child[]>('/listFamilyChildren');
      return response.data;
    });
  }

  async getTaskAssignmentsForDate(date: Date) {
    const formattedDate = format(date, 'yyyy-MM-dd');
    this.taskAssignments
      .execute(async () => {
        const response = await axios.get<{ date: string; assignments: TaskAssignment[] }>('/task-assignments', {
          params: { date: formattedDate },
        });
        return response.data.assignments;
      })
      .then((assignments) => this.setDayViewPresenter(assignments));
  }

  changeSelectedDate = (newDate: Date) => {
    const normalizedDate = startOfDay(newDate);
    if (this.selectedDate.getValue().getTime() !== normalizedDate.getTime()) {
      this.selectedDate.setValue(normalizedDate);
      this.getTaskAssignmentsForDate(normalizedDate);
    } else {
      this.dayViewPresenter.getValue()?.setTasksForSelectedDate(normalizedDate);
    }
  };

  changeSelectedChildFilter = (childId: number | 'all') => {
    if (this.selectedChildId.getValue() !== childId) {
      console.log(`TaskViewerPresenter: Changing child filter to ${childId}`);
      this.selectedChildId.setValue(childId);
      this.dayViewPresenter
        .getValue()
        ?.updateTasksAndAssignments(this.tasks.getValue(), this.taskAssignments.getValue(), this.selectedChildId, this.selectedDate.getValue());
    }
  };

  goToPreviousDay = () => {
    const newDate = addDays(this.selectedDate.getValue(), -1);
    this.changeSelectedDate(newDate);
  };

  goToNextDay = () => {
    const newDate = addDays(this.selectedDate.getValue(), 1);
    this.changeSelectedDate(newDate);
  };

  goToToday = () => {
    this.changeSelectedDate(new Date());
    this.changeSelectedChildFilter('all');
  };

  dispose() {
    this.selectedChildId.dispose();
    this.selectedDate.dispose();
    this.dayViewPresenter.getValue()?.dispose();
    this.dayViewPresenter.dispose();
    this.tasks.dispose();
    this.familyChildren.dispose();
    this.taskAssignments.dispose();
  }
}
