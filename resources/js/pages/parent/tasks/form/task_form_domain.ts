import { FieldDomain } from '@/components/domain_driven/field_domain';
import { ChildOption } from '@/components/domain_driven/fields/child_selection/dd_child_selection';
import { Option } from '@/components/domain_driven/fields/select/dd_select_field';
import { ObservableValue } from '@/hex/observable_value';
import { nullableOption, RecurrenceType, recurrenceTypeOptions, Task, TaskType, taskTypeOptions, timeOptions } from '../types';

export class TaskFormDomain implements TaskFormDomainPort {
  title: FieldDomain<string>;
  description: FieldDomain<string>;
  type: FieldDomain<Option<TaskType>>;
  needs_approval: FieldDomain<boolean>;
  is_collaborative: FieldDomain<boolean>;
  repeat_task: FieldDomain<boolean>;
  recurrence_type: FieldDomain<Option<RecurrenceType>>;
  recurrence_days: FieldDomain<string[]>;
  start_date: FieldDomain<Date | null>;
  recurrence_ends_on: FieldDomain<Date | null>;
  available_from_time: FieldDomain<Option<string | null>>;
  available_to_time: FieldDomain<Option<string | null>>;
  // Maybe future use
  //   completion_window_start: FieldDomain<string>;
  //   completion_window_end: FieldDomain<string>;
  suggested_duration_minutes: FieldDomain<number>;
  is_active: FieldDomain<boolean>;
  assigned_to: FieldDomain<ChildOption[]>;

  from_time_options: ObservableValue<Option<string>[]>;
  to_time_options: ObservableValue<Option<string>[]>;
  is_recurring: FieldDomain<boolean>;
  selected_recurrence_days: FieldDomain<string[]>;
  constructor(task: Task) {
    this.title = new FieldDomain('title', task.title);
    this.description = new FieldDomain('description', task.description);
    this.from_time_options = new ObservableValue<Option<string>[]>(timeOptions);
    this.to_time_options = new ObservableValue<Option<string>[]>(timeOptions);
    this.type = new FieldDomain('type', taskTypeOptions[0]);
    this.needs_approval = new FieldDomain('needs_approval', task.needs_approval);
    this.is_collaborative = new FieldDomain('is_collaborative', task.is_collaborative);
    this.repeat_task = new FieldDomain('repeat_task', task.recurrence_type !== RecurrenceType.NONE);
    this.recurrence_type = new FieldDomain('recurrence_type', recurrenceTypeOptions[0]);
    this.recurrence_days = new FieldDomain<string[]>('recurrence_days', task.recurrence_days);
    this.start_date = new FieldDomain<Date | null>('start_date', task.start_date);
    this.recurrence_ends_on = new FieldDomain<Date | null>('recurrence_ends_on', task.recurrence_ends_on);
    this.available_from_time = new FieldDomain(
      'available_from_time',
      timeOptions.find((option) => option.value === task.available_from_time) || nullableOption,
      {
        onChangeCallback: (field) => {
          const selectedValue = field.getValue();
          if (selectedValue) {
            const selectedTime = timeOptions.find((option) => option.value === selectedValue.value);
            if (selectedTime) {
              const selectedTimeIndex = timeOptions.findIndex((option) => option.value === selectedValue.value);
              this.to_time_options.setValue(timeOptions.slice(selectedTimeIndex + 1));
            }
          } else {
            this.from_time_options.setValue(timeOptions);
            this.to_time_options.setValue(timeOptions);
          }
        },
      },
    );
    this.available_to_time = new FieldDomain(
      'available_to_time',
      timeOptions.find((option) => option.value === task.available_to_time) || nullableOption,
      {
        onChangeCallback: (field) => {
          const selectedValue = field.getValue();
          if (selectedValue) {
            const selectedTime = timeOptions.find((option) => option.value === selectedValue.value);
            if (selectedTime) {
              const selectedTimeIndex = timeOptions.findIndex((option) => option.value === selectedValue.value);
              this.from_time_options.setValue(timeOptions.slice(0, selectedTimeIndex + 1));
            }
          } else {
            this.from_time_options.setValue(timeOptions);
            this.to_time_options.setValue(timeOptions);
          }
        },
      },
    );
    // this.completion_window_start = new FieldDomain('completion_window_start', '');
    // this.completion_window_end = new FieldDomain('completion_window_end', '');
    this.suggested_duration_minutes = new FieldDomain('suggested_duration_minutes', task.suggested_duration_minutes);
    this.is_active = new FieldDomain('is_active', task.is_active);
    this.assigned_to = new FieldDomain<ChildOption[]>(
      'assigned_to',
      task.assigned_to.map((child) => ({
        id: child.id.toString(),
        value: {
          child_id: child.id,
          tokens: child.tokens,
        },
        label: child.name,
      })),
      {
        onChangeCallback: (field) => {
          const selectedChildren = field.getValue() || [];
          const shouldBeEnabled = selectedChildren.length > 1;
          this.is_collaborative.setIsDisabled(!shouldBeEnabled);
          if (!shouldBeEnabled) {
            this.is_collaborative.setValue(false);
          }
        },
      },
    );
    this.is_recurring = new FieldDomain('is_recurring', false);
    this.selected_recurrence_days = new FieldDomain<string[]>('selected_recurrence_days', []);
  }
}

export interface TaskFormDomainPort {
  title: FieldDomain<string>;
  description: FieldDomain<string>;
  type: FieldDomain<Option<TaskType>>;
  needs_approval: FieldDomain<boolean>;
  is_collaborative: FieldDomain<boolean>;
  recurrence_type: FieldDomain<Option<RecurrenceType>>;
  recurrence_days: FieldDomain<string[]>;
  start_date: FieldDomain<Date | null>;
  recurrence_ends_on: FieldDomain<Date | null>;
  available_from_time: FieldDomain<Option<string | null>>;
  available_to_time: FieldDomain<Option<string | null>>;
  //   completion_window_start: FieldDomain<string>;
  //   completion_window_end: FieldDomain<string>;
  suggested_duration_minutes: FieldDomain<number>;
  is_active: FieldDomain<boolean>;
  assigned_to: FieldDomain<ChildOption[]>;

  from_time_options: ObservableValue<Option<string>[]>;
  to_time_options: ObservableValue<Option<string>[]>;
  is_recurring: FieldDomain<boolean>;
  selected_recurrence_days: FieldDomain<string[]>;
}
