import { ChildOption, DDChildSelection } from '@/components/domain_driven/fields/child_selection/dd_child_selection';
import { DDDatePickerField } from '@/components/domain_driven/fields/dd_date_picker_field';
import { DDRecurrenceSelector } from '@/components/domain_driven/fields/dd_recurrence_selector';
import { DDSwitchField } from '@/components/domain_driven/fields/dd_switch_field';
import { DDTextField } from '@/components/domain_driven/fields/dd_text_field';
import { DDTimeRangePickerField } from '@/components/domain_driven/fields/dd_time_range_picker_field';
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
    <div className="overflow-y-auto pr-2">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <DDTextField domain={domain.title} />
          <DDTextField domain={domain.description} />
          <DDSelectField domain={domain.type} options={taskTypeOptions} />
          <DDChildSelection domain={domain.assigned_children} options={childrenOptions} />
        </div>
        <div className="flex flex-col gap-3 rounded border p-3 md:flex-row">
          <DDDatePickerField domain={domain.start_date} clearable={false} />
          <DDTimeRangePickerField domain={domain.available_time_range} />
        </div>
        <div className="flex flex-col gap-3 rounded border p-3">
          <DDRecurrenceSelector recurrenceTypeDomain={domain.recurrence_type} recurrenceDaysDomain={domain.recurrence_days} />
          <DDDatePickerField domain={domain.recurrence_ends_on} />
        </div>
        <div className="flex flex-col gap-2 rounded border p-3">
          <DDSwitchField domain={domain.needs_approval} inline />
          <DDSwitchField domain={domain.is_active} inline />
          <DDSwitchField domain={domain.is_collaborative} inline />
        </div>
      </div>
    </div>
  );
};
