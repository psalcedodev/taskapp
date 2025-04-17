import { DayViewPresenter } from '@/components/day-view/day_view_presenter';
import { FormattedTask } from '@/components/day-view/types';
import { AsyncActionRunner } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import { FamilyChild } from '@/types/task';
import axios from 'axios';
import { addDays, startOfDay } from 'date-fns';

export type ViewMode = 'day' | 'week' | 'month';

export type HourlyTasksResponse = Record<number, FormattedTask[]>;

export class TaskViewerPresenter {
  viewMode: ViewMode;
  today: Date;
  currentHour: number;
  familyChildren = new AsyncActionRunner<FamilyChild[]>([]);
  selectedDate = new ObservableValue<Date>(startOfDay(new Date()));
  selectedChildId = new ObservableValue<number | 'all'>('all');

  dayViewPresenter: DayViewPresenter;

  constructor() {
    this.viewMode = 'day';
    this.today = new Date();
    this.currentHour = this.today.getHours();
    this.dayViewPresenter = new DayViewPresenter(this.selectedDate, this.selectedChildId);
  }

  async getFamilyChildren() {
    this.familyChildren.execute(async () => {
      const response = await axios.get<FamilyChild[]>('/listFamilyChildren');
      console.log(response.data);
      return response.data;
    });
  }

  changeSelectedDate = (newDate: Date) => {
    const normalizedDate = startOfDay(newDate);
    if (this.selectedDate.getValue().getTime() !== normalizedDate.getTime()) {
      this.selectedDate.setValue(normalizedDate);
    }
  };

  changeSelectedChildFilter = (childId: number | 'all') => {
    if (this.selectedChildId.getValue() !== childId) {
      console.log(`TaskViewerPresenter: Changing child filter to ${childId}`);
      this.selectedChildId.setValue(childId);
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
    this.dayViewPresenter.dispose();
    this.dayViewPresenter.dispose();
    this.familyChildren.dispose();
  }
}
