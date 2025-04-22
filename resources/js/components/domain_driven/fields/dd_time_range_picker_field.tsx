import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FieldDescriptionInfo } from './field_description_info';
import { FieldErrorInfo } from './field_error_info';

// --- Optimization: Pre-generate options ---
const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
// ---------------------------------------

// Helper function to convert HH:mm:ss to h:mm AM/PM
const formatTimeTo12Hour = (time24: string | null): string | null => {
  if (!time24) return null;
  const parts = time24.split(':');
  const hours = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1], 10);
  // Seconds are parsed but not used in the output format unless needed
  // const seconds = parts[2] ? parseInt(parts[2], 10) : 0;

  if (isNaN(hours) || isNaN(minutes)) return time24; // Return original if invalid

  const ampm = hours >= 12 ? 'PM' : 'AM';
  let hours12 = hours % 12;
  hours12 = hours12 ? hours12 : 12; // Handle midnight (00 -> 12)
  const minutesStr = minutes.toString().padStart(2, '0');
  // const secondsStr = seconds.toString().padStart(2, '0'); // If needed for display

  // Return h:mm AM/PM format
  return `${hours12}:${minutesStr} ${ampm}`;
  // Optionally return h:mm:ss AM/PM:
  // return `${hours12}:${minutesStr}:${secondsStr} ${ampm}`;
};

// Define the shape of the value managed by the domain
export interface TimeRange {
  start: string | null;
  end: string | null;
}

// Props for the main component
interface DDTimeRangePickerFieldProps {
  domain: FieldDomain<TimeRange>;
  placeholder?: string;
  hideLabel?: boolean;
  labelClassName?: string;
  labelEndAdornment?: React.ReactNode;
  clearable?: boolean;
}

// Reusable internal component for selecting Hours and Minutes, outputting HH:mm:00
interface TimeSelectorProps {
  value: string | null; // Expects HH:mm:ss format or null
  onChange: (value: string) => void; // Returns HH:mm:00 format
  label: string; // e.g., "Start Time", "End Time"
  disabled?: boolean;
}

// --- Optimization: Memoize the component ---
const TimeSelector: React.FC<TimeSelectorProps> = React.memo(({ value, onChange, label, disabled }) => {
  // -------------------------------------------
  // Parse HH:mm from potential HH:mm:ss
  const initialParts = value?.split(':') || ['00', '00'];
  const initialHour = initialParts[0];
  const initialMinute = initialParts[1] || '00';
  // REMOVED: initialSecond

  const [hour, setHour] = useState(initialHour);
  const [minute, setMinute] = useState(initialMinute);
  // REMOVED: second state

  // Update internal state if the prop value changes externally
  useEffect(() => {
    const parts = value?.split(':') || ['00', '00'];
    setHour(parts[0]);
    setMinute(parts[1] || '00');
    // REMOVED: setSecond
  }, [value]);

  const handleHourChange = (newHour: string) => {
    setHour(newHour);
    onChange(`${newHour}:${minute}:00`); // Append :00
  };

  const handleMinuteChange = (newMinute: string) => {
    setMinute(newMinute);
    onChange(`${hour}:${newMinute}:00`); // Append :00
  };

  // REMOVED: handleSecondChange

  return (
    <div className="flex flex-col items-start gap-1">
      {/* Main label */}
      <span className="text-muted-foreground mb-1 text-sm font-medium">{label}</span>
      <div className="flex items-start gap-1">
        {/* Hours Select */}
        <div className="flex flex-col items-center gap-1">
          <Select value={hour} onValueChange={handleHourChange} disabled={disabled}>
            <SelectTrigger className="w-[65px]">
              <SelectValue placeholder="HH" />
            </SelectTrigger>
            <SelectContent>
              {hourOptions.map((h) => (
                <SelectItem key={h} value={h}>
                  {h}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground text-xs">Hour</span>
        </div>
        <span className="text-muted-foreground pt-2">:</span>
        {/* Minutes Select */}
        <div className="flex flex-col items-center gap-1">
          <Select value={minute} onValueChange={handleMinuteChange} disabled={disabled}>
            <SelectTrigger className="w-[65px]">
              <SelectValue placeholder="MM" />
            </SelectTrigger>
            <SelectContent>
              {minuteOptions.map((m) => (
                <SelectItem key={m} value={m}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-muted-foreground text-xs">Minute</span>
        </div>
      </div>
    </div>
  );
});
TimeSelector.displayName = 'TimeSelector';

// Main Time Range Picker Component
export const DDTimeRangePickerField: React.FC<DDTimeRangePickerFieldProps> = ({
  domain,
  placeholder = 'Select time range',
  hideLabel,
  labelClassName,
  labelEndAdornment,
  clearable = true,
}) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const value = domain.getValue() || { start: null, end: null };
  const name = domain.getName();
  const label = domain.getLabel();
  const description = domain.getDescription();
  const disabled = domain.getIsDisabled();

  const [isOpen, setIsOpen] = useState(false);
  // Temporary state for the popover selectors
  const [tempStartTime, setTempStartTime] = useState<string | null>(value.start);
  const [tempEndTime, setTempEndTime] = useState<string | null>(value.end);

  // Update temporary state when popover opens or value changes
  useEffect(() => {
    if (isOpen) {
      setTempStartTime(value.start);
      setTempEndTime(value.end);
    }
  }, [isOpen, value.start, value.end]);

  const handleApply = () => {
    // Basic validation: Ensure end time is after start time if both are set
    if (tempStartTime && tempEndTime && tempStartTime >= tempEndTime) {
      // TODO: Implement proper error handling for invalid range
      console.warn('End time should be after start time.');
      // Maybe set an internal error state to show FieldErrorInfo inside PopoverContent?
    }
    // Apply button uses the HH:mm:00 format from the temp state
    onChange({ start: tempStartTime, end: tempEndTime });
    setIsOpen(false);
  };

  // Handler to clear times
  const handleClearTimes = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent popover opening
    onChange({ start: null, end: null });
  };

  // Display function uses formatTimeTo12Hour which now handles HH:mm:ss input
  const formatDisplayValue = () => {
    const start12 = formatTimeTo12Hour(value.start);
    const end12 = formatTimeTo12Hour(value.end);

    if (start12 && end12) {
      return `${start12} - ${end12}`;
    } else if (start12) {
      return `Start: ${start12}`;
    } else if (end12) {
      return `End: ${end12}`;
    }
    return placeholder;
  };

  console.log(value);
  const descriptionInfoElement = <FieldDescriptionInfo description={description} />;
  const errorInfoElement = <FieldErrorInfo errorMessage={errorMessage} />;
  const isErrorIconVisible = !!errorMessage && !disabled;
  const showClearButton = clearable && (value.start || value.end) && !disabled;

  return (
    <div className="relative w-full">
      <div className={cn('flex flex-col', disabled && 'cursor-not-allowed opacity-50')}>
        {!hideLabel && (
          <div className="mb-2 flex w-full items-center justify-between">
            <div className="flex items-center">
              <Label
                data-slot="form-label"
                data-error={!!errorMessage}
                className={cn('data-[error=true]:text-destructive-foreground', labelClassName)}
                htmlFor={name}
              >
                {label}
              </Label>
              {descriptionInfoElement}
            </div>
            {labelEndAdornment && <div>{labelEndAdornment}</div>}
          </div>
        )}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div
              role="button"
              aria-haspopup="dialog"
              aria-expanded={isOpen}
              tabIndex={disabled ? -1 : 0}
              id={name}
              onClick={() => !disabled && setIsOpen(true)}
              onKeyDown={(e) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                  setIsOpen(true);
                }
              }}
              className={cn(
                'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full items-center justify-between rounded-md border py-2 pl-3 text-left text-sm font-normal focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                errorMessage && 'border-destructive text-destructive-foreground focus-visible:ring-destructive',
                disabled && 'cursor-not-allowed bg-gray-300/20 opacity-50',
                !disabled && 'hover:bg-accent hover:text-accent-foreground',
                isErrorIconVisible || showClearButton ? 'pr-10' : 'pr-3',
              )}
            >
              <span
                className={cn(
                  'flex-1 truncate',
                  disabled && 'text-muted-foreground',

                  value.end === null || value.start === null ? 'text-muted-foreground' : '',
                )}
              >
                {formatDisplayValue()}
              </span>
              <div className="absolute right-0 flex items-center pr-3">
                {isErrorIconVisible
                  ? errorInfoElement
                  : showClearButton && (
                      <button
                        type="button"
                        onClick={handleClearTimes}
                        className="focus:ring-ring inline-flex items-center justify-center rounded-full focus:ring-2 focus:ring-offset-2 focus:outline-none"
                        aria-label="Clear time range"
                      >
                        <X className="text-muted-foreground hover:text-foreground h-4 w-4 flex-shrink-0" />
                      </button>
                    )}
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="flex flex-col gap-4">
              <div className="flex items-end gap-3">
                <TimeSelector label="Start Time" value={tempStartTime} onChange={setTempStartTime} disabled={disabled} />
                <TimeSelector label="End Time" value={tempEndTime} onChange={setTempEndTime} disabled={disabled} />
              </div>
              <Button onClick={handleApply} disabled={disabled} size="sm" className="self-end">
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
