import { FieldDomain } from '@/components/domain_driven/field_domain';
import { DDSelectField, Option } from '@/components/domain_driven/fields/select/dd_select_field';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { enumToList } from '@/hooks/enums_to_list';
import { useAsyncValue } from '@/hooks/use_async_value';
import { cn } from '@/lib/utils';
import React from 'react';

export enum RecurrenceType {
  NONE = 'none',
  DAILY = 'daily',
  WEEKDAYS = 'weekdays',
  WEEKENDS = 'weekends',
  CUSTOM = 'custom',
}

const recurrenceTypeLabels = {
  [RecurrenceType.NONE]: 'None (One-time task)',
  [RecurrenceType.DAILY]: 'Daily',
  [RecurrenceType.WEEKDAYS]: 'Weekdays (Mon-Fri)',
  [RecurrenceType.WEEKENDS]: 'Weekends (Sat-Sun)',
  [RecurrenceType.CUSTOM]: 'Custom',
};

export const recurrenceTypeOptions = enumToList(RecurrenceType, recurrenceTypeLabels);

// create a map of recurrence type to days like: Record<RecurrenceType, Option<RecurrenceType>>
export const recurrenceTypeOptionsMap: Record<RecurrenceType, Option<RecurrenceType>> = {
  [RecurrenceType.NONE]: recurrenceTypeOptions[0],
  [RecurrenceType.DAILY]: recurrenceTypeOptions[1],
  [RecurrenceType.WEEKDAYS]: recurrenceTypeOptions[2],
  [RecurrenceType.WEEKENDS]: recurrenceTypeOptions[3],
  [RecurrenceType.CUSTOM]: recurrenceTypeOptions[4],
};

const allWeekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const weekdaysOnly = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const weekendsOnly = ['Sat', 'Sun'];

// Map recurrence types to their corresponding day arrays
export const daysForRecurrenceType: Record<RecurrenceType, string[]> = {
  none: [],
  daily: allWeekDays,
  weekdays: weekdaysOnly,
  weekends: weekendsOnly,
  custom: [], // Custom starts empty or uses existing, handled in logic
};

// --- Component Props ---
interface DDRecurrenceSelectorProps {
  recurrenceTypeDomain: FieldDomain<Option<RecurrenceType>>;
  recurrenceDaysDomain: FieldDomain<string[]>;
  // You might want overall labels/descriptions for the combined component
  // label?: string;
  // description?: string;
}

// --- Component ---
export const DDRecurrenceSelector: React.FC<DDRecurrenceSelectorProps> = ({ recurrenceTypeDomain, recurrenceDaysDomain }) => {
  // Sync with domains - Use domain.getValue()
  const { onChange: onDaysChange, errorMessage: daysError } = useDDFieldSync(recurrenceDaysDomain);

  // Get values directly from domain
  const typeValue = recurrenceTypeDomain.getValue();
  const selectedDays = useAsyncValue(recurrenceDaysDomain.state).getValue();
  const daysLabel = recurrenceDaysDomain.getLabel(); // Label for the custom days section
  const daysDescription = recurrenceDaysDomain.getDescription(); // Description for custom days
  const isTypeDisabled = recurrenceTypeDomain.getIsDisabled();
  const areDaysDisabled = recurrenceDaysDomain.getIsDisabled() || typeValue?.value !== 'custom';

  const selectedRecurrenceType = typeValue?.value ?? 'none';

  // Handle toggling individual days (only when type is 'custom')
  const handleDayToggle = (day: string) => {
    if (isTypeDisabled || areDaysDisabled || selectedRecurrenceType !== 'custom') return;

    const currentDays = selectedDays ?? [];
    // Add type to filter parameter
    const newSelection = currentDays.includes(day) ? currentDays.filter((d: string) => d !== day) : [...currentDays, day];
    console.log('newSelection', newSelection);
    onDaysChange(newSelection);
  };

  return (
    <div className="relative w-full">
      <DDSelectField domain={recurrenceTypeDomain} options={recurrenceTypeOptions} />
      {/* Custom Day Selector (Conditional) */}
      {selectedRecurrenceType === 'custom' && (
        <div className={cn('mt-3 w-full space-y-2', areDaysDisabled && 'cursor-not-allowed opacity-70')}>
          {daysLabel && (
            <Label
              data-slot="form-label"
              data-error={!!daysError}
              className={cn('data-[error=true]:text-destructive-foreground block', areDaysDisabled && 'opacity-70')}
            >
              {daysLabel}
            </Label>
          )}
          <div className={cn('flex w-full flex-wrap justify-start gap-1', areDaysDisabled && 'pointer-events-none')}>
            {allWeekDays.map((day) => {
              const isSelected = selectedDays?.includes(day);
              return (
                <Button
                  key={day}
                  variant={isSelected ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleDayToggle(day)}
                  className="h-8 w-10 px-2"
                  disabled={areDaysDisabled}
                  aria-pressed={isSelected}
                >
                  {day}
                </Button>
              );
            })}
          </div>
          {(daysDescription || daysError) && !areDaysDisabled && (
            <p className={cn('text-muted-foreground mt-1 text-xs', daysError && 'text-destructive-foreground')}>{daysError || daysDescription}</p>
          )}
        </div>
      )}
    </div>
  );
};
