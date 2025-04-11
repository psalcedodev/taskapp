import { ChildOption, DDChildSelection } from '@/components/domain_driven/fields/child_selection/dd_child_selection';
import { DDDatePickerField } from '@/components/domain_driven/fields/dd_date_picker_field';
import { DDDayOfWeekSelector } from '@/components/domain_driven/fields/dd_day_of_week_selector';
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

export interface TaskFormProps {
  domain: TaskFormDomainPort;
  childrenOptions: ChildOption[];
}

export const TaskForm: React.FC<TaskFormProps> = ({ domain, childrenOptions }) => {
  const from_time_options = useAsyncValue(domain.from_time_options);
  const to_time_options = useAsyncValue(domain.to_time_options);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <DDTextField domain={domain.title} />
        <DDTextField domain={domain.description} />
        <DDChildSelection domain={domain.assigned_to} options={childrenOptions} />
        <DDSelectField domain={domain.type} options={taskTypeOptions} />
      </div>

      <div className="flex flex-col gap-3 rounded border p-3">
        <h3 className="text-md mb-2 font-semibold">Scheduling</h3>
        <div className="flex w-full flex-row items-start gap-2">
          <div className="flex-1">
            <DDDatePickerField domain={domain.start_date} />
          </div>
          <div className="flex-1">
            <DDSelectField domain={domain.available_from_time} options={from_time_options} />
          </div>
          <div className="flex-1">
            <DDSelectField domain={domain.available_to_time} options={to_time_options} />
          </div>
        </div>
        <DDNumberField domain={domain.suggested_duration_minutes} />
      </div>

      <div className="flex flex-col gap-3 rounded border p-3">
        <h3 className="text-md mb-1 font-semibold">Recurrence</h3>
        <DDDayOfWeekSelector domain={domain.recurrence_days} />
        <Button variant="outline" className="w-full justify-start">
          <div className="flex w-full items-center justify-between">
            <div className="flex items-center">
              <RotateCcwIcon className="mr-2 h-4 w-4" />
              <span>Configure Recurrence</span>
            </div>
            <ChevronRightIcon className="h-4 w-4" />
          </div>
        </Button>
        <DDDatePickerField domain={domain.recurrence_ends_on} />
      </div>

      <div className="flex flex-col gap-2 rounded border p-3">
        <h3 className="text-md mb-1 font-semibold">Settings</h3>
        <DDSwitchField domain={domain.needs_approval} inline />
        <DDSwitchField domain={domain.is_active} inline />
        <DDSwitchField domain={domain.is_collaborative} inline />
      </div>

      {/*
      Hidden for now. We might need it later if we want to be more strict about the completion window.
      <div className="flex w-full flex-row gap-2">
      <DDTextField domain={domain.completion_window_start} />
      <DDTextField domain={domain.completion_window_end} />
      </div>
      */}
    </div>
  );
};
