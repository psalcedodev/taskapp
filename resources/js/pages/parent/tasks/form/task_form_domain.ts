import { FieldDomain } from '@/components/domain_driven/field_domain';
import { ChildOption } from '@/components/domain_driven/fields/child_selection/dd_child_selection';
import { RecurrenceType, recurrenceTypeOptions } from '@/components/domain_driven/fields/dd_recurrence_selector';
import { TimeRange } from '@/components/domain_driven/fields/dd_time_range_picker_field';
import { Option } from '@/components/domain_driven/fields/select/dd_select_field';
import { format, isValid } from 'date-fns';
import { TaskType, taskTypeOptions } from '../types';
import { TaskRequestData } from './form_types';

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
  available_time_range: FieldDomain<TimeRange>;
  is_active: FieldDomain<boolean>;
  assigned_children: FieldDomain<ChildOption[]>;
  is_recurring: FieldDomain<boolean>;
  selected_recurrence_days: FieldDomain<string[]>;
  constructor(task: TaskRequestData) {
    console.log('task', task);
    this.title = new FieldDomain('title', task.title, {
      description: 'The title of the task',
      shouldValidateOnChange: true,
      validate: (value) => {
        if (value.getValue().length < 3) {
          throw new Error('Title must be at least 3 characters long');
        }
      },
    });
    this.description = new FieldDomain('description', task.description, {
      description: 'The description of the task',
    });
    this.type = new FieldDomain('type', taskTypeOptions[0], {
      description: 'Routine or Challenge(Chores)',
    });
    this.assigned_children = new FieldDomain<ChildOption[]>(
      'assigned_children',
      task.assigned_children.map((child) => ({
        id: child.id.toString(),
        value: {
          child_id: child.id,
          tokens: child.token_reward,
        },
        label: child.name,
      })),
      {
        shouldValidateOnChange: true,
        validate: (field) => {
          if (field.getValue().length === 0) {
            throw new Error('At least one child must be assigned');
          }
        },
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

    this.repeat_task = new FieldDomain('repeat_task', task.recurrence_type !== RecurrenceType.NONE);
    this.recurrence_type = new FieldDomain('recurrence_type', recurrenceTypeOptions[0]);
    this.recurrence_days = new FieldDomain<string[]>('recurrence_days', task.recurrence_days);
    this.start_date = new FieldDomain<Date | null>('start_date', task.start_date ? new Date(task.start_date) : new Date(), {
      description: 'The date the task will start. Defaults to today.',
    });
    this.recurrence_ends_on = new FieldDomain<Date | null>('recurrence_ends_on', task.recurrence_ends_on ? new Date(task.recurrence_ends_on) : null, {
      description: 'The date the recurrence will end. Leave blank for no end date.',
    });
    this.available_time_range = new FieldDomain<TimeRange>(
      'available_time_range',
      {
        start: task.available_from_time ?? null,
        end: task.available_to_time ?? null,
      },
      {
        description: 'The time range when the task is available to be completed. Leave blank for anytime.',
        shouldValidateOnChange: true,
        validate: (value) => {
          const { start, end } = value.getValue();
          if (start && end && start >= end) {
            throw new Error('Available to time must be after available from time');
          }
        },
      },
    );
    // this.suggested_duration_minutes = new FieldDomain('suggested_duration_minutes', task.suggested_duration_minutes);
    this.is_active = new FieldDomain('is_active', task.is_active);
    this.needs_approval = new FieldDomain('needs_approval', task.needs_approval);
    this.is_collaborative = new FieldDomain('is_collaborative', task.is_collaborative, {
      isDisabled: true,
    });
    this.is_recurring = new FieldDomain('is_recurring', false);
    this.selected_recurrence_days = new FieldDomain<string[]>('selected_recurrence_days', []);
  }

  async validate() {
    const fieldsToValidate = [
      this.title,
      this.description,
      this.type,
      this.assigned_children,
      this.recurrence_type,
      this.recurrence_days,
      this.start_date,
      this.recurrence_ends_on,
      this.available_time_range,
      this.is_active,
      this.needs_approval,
      this.is_collaborative,
      this.is_recurring,
      this.selected_recurrence_days,
    ];
    const result = await Promise.all(
      fieldsToValidate.map((field) =>
        field
          .validate()
          .then(() => true)
          .catch(() => false),
      ),
    );
    return result.every(Boolean);
  }

  isPristine() {
    return (
      this.title.isPristine() &&
      this.description.isPristine() &&
      this.type.isPristine() &&
      this.assigned_children.isPristine() &&
      this.recurrence_type.isPristine() &&
      this.recurrence_days.isPristine() &&
      this.start_date.isPristine() &&
      this.recurrence_ends_on.isPristine() &&
      this.available_time_range.isPristine() &&
      this.is_active.isPristine() &&
      this.needs_approval.isPristine() &&
      this.is_collaborative.isPristine() &&
      this.is_recurring.isPristine() &&
      this.selected_recurrence_days.isPristine()
    );
  }

  toRequestData(): TaskRequestData {
    const startDateValue = this.start_date.getValue();
    const recurrenceEndsOnValue = this.recurrence_ends_on.getValue();
    const availableTime = this.available_time_range.getValue();

    console.log('requestData', {
      title: this.title.getValue(),
      description: this.description.getValue(),
      type: this.type.getValue()?.value,
      needs_approval: this.needs_approval.getValue(),
      is_collaborative: this.is_collaborative.getValue(),
      recurrence_type: this.recurrence_type.getValue()?.value,
      recurrence_days: this.recurrence_days.getValue(),
      start_date: startDateValue && isValid(startDateValue) ? format(startDateValue, 'yyyy-MM-dd') : null,
      recurrence_ends_on: recurrenceEndsOnValue && isValid(recurrenceEndsOnValue) ? format(recurrenceEndsOnValue, 'yyyy-MM-dd') : null,
      available_from_time: availableTime?.start ?? null,
      available_to_time: availableTime?.end ?? null,
      is_active: this.is_active.getValue(),
      assigned_children: this.assigned_children.getValue().map((child) => ({
        id: child.value.child_id,
        name: child.label,
        token_reward: child.value.tokens ?? 0,
      })),
    });

    return {
      title: this.title.getValue(),
      description: this.description.getValue(),
      type: this.type.getValue()?.value,
      needs_approval: this.needs_approval.getValue(),
      is_collaborative: this.is_collaborative.getValue(),
      recurrence_type: this.recurrence_type.getValue()?.value,
      recurrence_days: this.recurrence_days.getValue(),
      start_date: startDateValue && isValid(startDateValue) ? format(startDateValue, 'yyyy-MM-dd') : null,
      recurrence_ends_on: recurrenceEndsOnValue && isValid(recurrenceEndsOnValue) ? format(recurrenceEndsOnValue, 'yyyy-MM-dd') : null,
      available_from_time: availableTime?.start ?? null,
      available_to_time: availableTime?.end ?? null,
      is_active: this.is_active.getValue(),
      assigned_children: this.assigned_children.getValue().map((child) => ({
        id: child.value.child_id,
        name: child.label,
        token_reward: child.value.tokens ?? 0,
      })),
    };
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
  available_time_range: FieldDomain<TimeRange>;
  is_active: FieldDomain<boolean>;
  assigned_children: FieldDomain<ChildOption[]>;
  is_recurring: FieldDomain<boolean>;
  selected_recurrence_days: FieldDomain<string[]>;
}
