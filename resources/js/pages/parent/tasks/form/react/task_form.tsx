import { ChildOption, DDChildSelection } from '@/components/domain_driven/fields/child_selection/dd_child_selection';
import { DDDatePickerField } from '@/components/domain_driven/fields/dd_date_picker_field';
import { DDDayOfWeekSelector } from '@/components/domain_driven/fields/dd_day_of_week_selector';
import { DDSwitchField } from '@/components/domain_driven/fields/dd_switch_field';
import { DDTextField } from '@/components/domain_driven/fields/dd_text_field';
import { DDTimePickerField } from '@/components/domain_driven/fields/dd_time_picker_field';
import { DDSelectField } from '@/components/domain_driven/fields/select/dd_select_field';
import React from 'react';
import { taskTypeOptions } from '../../types';
import { TaskFormDomainPort } from '../task_form_domain';

export interface TaskFormProps {
  domain: TaskFormDomainPort;
  childrenOptions: ChildOption[];
}

export const TaskForm: React.FC<TaskFormProps> = ({ domain, childrenOptions }) => {
  return (
    <div className="flex flex-col gap-4">
      {/* Basic Information Section */}
      <div className="flex flex-col gap-2">
        <DDTextField domain={domain.title} />
        <DDTextField domain={domain.description} />
        <DDChildSelection domain={domain.children} options={childrenOptions} />
        <DDSelectField domain={domain.type} options={taskTypeOptions} />
      </div>

      {/* Accordion Sections */}

      <div className="flex flex-col gap-3 rounded border p-3">
        <DDDatePickerField domain={domain.start_date} />
        <div className="flex w-full flex-row items-start gap-2">
          <DDTimePickerField domain={domain.available_from_time} />
          <DDTimePickerField domain={domain.available_to_time} />
        </div>
        <span className="text-muted-foreground -mt-2 text-xs">Leave blank for anytime</span>
      </div>

      {/* Recurrence Section */}

      <div className="flex flex-col gap-3 rounded border p-3">
        <DDDayOfWeekSelector domain={domain.recurrence_days} />
        <DDDatePickerField domain={domain.recurrence_ends_on} />
      </div>
      <div className="flex flex-col gap-2 rounded border p-3">
        <DDSwitchField domain={domain.needs_approval} inline />
        <DDSwitchField domain={domain.is_active} inline />
        <DDSwitchField domain={domain.is_collaborative} inline />
      </div>

      {/* Hidden Completion Window Section */}
      {/**
      Hidden for now. We might need it later if we want to be more strict about the completion window.
      <div className="flex w-full flex-row gap-2">
      <DDTextField domain={domain.completion_window_start} />
      <DDTextField domain={domain.completion_window_end} />
      </div>
      */}
    </div>
  );
};
