import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import { format, parse } from 'date-fns';
import { Clock, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { FieldDescriptionInfo } from './field_description_info';
import { FieldErrorInfo } from './field_error_info';

// --- Optimization: Pre-generate options (copied from DDTimeRangePickerField) ---
const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minuteOptions = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));
// ------------------------------------------------------------------------------

// Helper function to convert HH:mm to h:mm AM/PM (modified for display)
const formatTimeTo12HourDisplay = (time24: string | null): string | null => {
  if (!time24) return null;
  try {
    // Create a dummy date just to use date-fns formatting
    const date = parse(time24, 'HH:mm', new Date());
    return format(date, 'h:mm aa');
  } catch (error) {
    console.error('Error formatting time:', error);
    return time24; // Fallback to original string if parsing fails
  }
};

export interface DDTimePickerFieldProps {
  domain: FieldDomain<string | null>;
  placeholder?: string;
  labelEndAdornment?: React.ReactNode;
  hideLabel?: boolean;
  labelClassName?: string;
  nullable?: boolean;
  clearable?: boolean;
}

export const DDTimePickerField: React.FC<DDTimePickerFieldProps> = ({
  domain,
  placeholder = 'Select a time',
  labelEndAdornment,
  hideLabel,
  labelClassName,
  nullable = true,
  clearable = true,
}) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const value = domain.getValue();
  const name = domain.getName();
  const label = domain.getLabel();
  const description = domain.getDescription();
  const disabled = domain.getIsDisabled();

  const [isOpen, setIsOpen] = React.useState(false);
  const [tempTime, setTempTime] = useState<string | null>(value);

  useEffect(() => {
    if (isOpen) {
      setTempTime(value);
    }
  }, [isOpen, value]);

  const handleApply = () => {
    onChange(tempTime);
    setIsOpen(false);
  };

  const handleClearTime = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setTempTime(null);
    setIsOpen(false);
  };

  const descriptionInfoElement = <FieldDescriptionInfo description={description} />;
  const errorInfoElement = <FieldErrorInfo errorMessage={errorMessage} />;
  const isErrorIconVisible = !!errorMessage && !disabled;
  const showClearButton = clearable && value && !disabled && nullable;

  const tempHour = tempTime?.split(':')[0] || '12';
  const tempMinute = tempTime?.split(':')[1] || '00';

  const handleHourChange = (newHour: string) => {
    setTempTime(`${newHour}:${tempMinute}`);
  };
  const handleMinuteChange = (newMinute: string) => {
    setTempTime(`${tempHour}:${newMinute}`);
  };

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
                'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full items-center justify-start rounded-md border py-2 pl-3 text-left text-sm font-normal focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                !value && 'text-muted-foreground',
                errorMessage && 'border-destructive text-destructive-foreground focus-visible:ring-destructive',
                disabled && 'cursor-not-allowed bg-gray-300/20 opacity-50',
                !disabled && 'hover:bg-accent hover:text-accent-foreground',
                isErrorIconVisible || showClearButton ? 'pr-10' : 'pr-3',
              )}
            >
              <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="flex-1 truncate">{formatTimeTo12HourDisplay(value) ?? placeholder}</span>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                {isErrorIconVisible
                  ? errorInfoElement
                  : showClearButton && (
                      <button
                        type="button"
                        onClick={handleClearTime}
                        className="focus:ring-ring inline-flex items-center justify-center rounded-full focus:ring-2 focus:ring-offset-2 focus:outline-none"
                        aria-label="Clear time"
                      >
                        <X className="text-muted-foreground hover:text-foreground h-4 w-4" />
                      </button>
                    )}
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <div className="flex flex-col gap-4">
              <div className="flex items-end gap-3">
                <div className="flex flex-col items-start gap-1">
                  <span className="text-muted-foreground text-xs font-medium">Hour</span>
                  <Select value={tempHour} onValueChange={handleHourChange} disabled={disabled}>
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
                </div>
                <span className="text-muted-foreground pb-2">:</span>
                <div className="flex flex-col items-start gap-1">
                  <span className="text-muted-foreground text-xs font-medium">Minute</span>
                  <Select value={tempMinute} onValueChange={handleMinuteChange} disabled={disabled}>
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
                </div>
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
