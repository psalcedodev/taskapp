import { ChildOption, DDChildSelection } from '@/components/domain_driven/fields/child_selection/dd_child_selection';
import { DDDatePickerField } from '@/components/domain_driven/fields/dd_date_picker_field';
import { DDNumberField } from '@/components/domain_driven/fields/dd_number_field';
import { DDSwitchField } from '@/components/domain_driven/fields/dd_switch_field';
import { DDTextField } from '@/components/domain_driven/fields/dd_text_field';
import { DDSelectField } from '@/components/domain_driven/fields/select/dd_select_field';
import { Button } from '@/components/ui/button';
import { useAsyncValue } from '@/hooks/use_async_value';
import { ChevronRightIcon, RotateCcwIcon } from 'lucide-react';
import React from 'react';
import { taskTypeOptions } from '../../types';
import { TaskFormDomainPort } from '../task_form_domain';
import { DynamicRecurrenceDisplay } from './dynamic_recurrence_display';

export interface TaskFormProps {
  domain: TaskFormDomainPort;
  childrenOptions: ChildOption[];
}
export const TaskForm: React.FC<TaskFormProps> = ({ domain, childrenOptions }) => {
  const from_time_options = useAsyncValue(domain.from_time_options);
  const to_time_options = useAsyncValue(domain.to_time_options);

  return (
    <div className="flex flex-col gap-2">
      <DDTextField domain={domain.title} />
      <DDTextField domain={domain.description} />
      <DDChildSelection domain={domain.assigned_to} options={childrenOptions} />
      <DDSelectField domain={domain.type} options={taskTypeOptions} />
      <DDSwitchField domain={domain.needs_approval} inline />
      <DDSwitchField domain={domain.is_active} inline />
      <Button variant="outline" className="w-full justify-start">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center">
            <RotateCcwIcon className="mr-2 h-4 w-4" />
            <DynamicRecurrenceDisplay
              domain={{
                is_recurring: domain.is_recurring,
                selected_recurrence_days: domain.selected_recurrence_days,
              }}
            />
          </div>
          <ChevronRightIcon className="h-4 w-4" />
        </div>
      </Button>
      Start date and Time
      <div className="flex w-full flex-row gap-2">
        <DDDatePickerField domain={domain.start_date} />
        <DDDatePickerField domain={domain.recurrence_ends_on} />
      </div>
      <div className="flex w-full flex-row gap-2">
        <DDSelectField domain={domain.available_from_time} options={from_time_options} />
        <DDSelectField domain={domain.available_to_time} options={to_time_options} />
      </div>
      <DDNumberField domain={domain.suggested_duration_minutes} />
      {/*
      Hidden for now. We might need it later if we want to be more strict about the completion window.
      <div className="flex w-full flex-row gap-2">
      <DDTextField domain={domain.completion_window_start} />
      <DDTextField domain={domain.completion_window_end} />
      </div>
      */}
      <DDSwitchField domain={domain.is_collaborative} inline />
    </div>
  );
};
