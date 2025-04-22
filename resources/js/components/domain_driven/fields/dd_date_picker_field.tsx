import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import { format, startOfDay } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import React from 'react';
import { FieldDescriptionInfo } from './field_description_info';
import { FieldErrorInfo } from './field_error_info';

export interface DDDatePickerFieldProps {
  domain: FieldDomain<Date | null>;
  placeholder?: string;
  labelEndAdornment?: React.ReactNode;
  hideLabel?: boolean;
  labelClassName?: string;
  nullable?: boolean;
  minDate?: Date;
  maxDate?: Date;
  isInline?: boolean;
  clearable?: boolean;
}

export const DDDatePickerField: React.FC<DDDatePickerFieldProps> = ({
  domain,
  placeholder = 'Select a date',
  labelEndAdornment,
  hideLabel,
  labelClassName,
  nullable = true,
  minDate,
  maxDate,
  isInline,
  clearable = true,
}) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const value = domain.getValue();
  const label = domain.getLabel();
  const description = domain.getDescription();
  const disabled = domain.getIsDisabled();

  const [isOpen, setIsOpen] = React.useState(false);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date);
    } else if (nullable) {
      onChange(null);
    }
    setIsOpen(false);
  };

  const handleClearDate = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setIsOpen(false);
  };

  const descriptionInfoElement = <FieldDescriptionInfo description={description} />;
  const errorInfoElement = <FieldErrorInfo errorMessage={errorMessage} />;
  const isErrorIconVisible = !!errorMessage && !disabled;

  return (
    <div className="relative w-full">
      <div className={cn('flex flex-col', isInline && 'flex-row items-center gap-4')}>
        {!hideLabel && (
          <div className="mb-2.5 flex w-full items-center justify-between">
            <div className="flex items-center">
              <Label
                data-slot="form-label"
                data-error={!!errorMessage}
                className={cn('data-[error=true]:text-destructive-foreground', labelClassName)}
                htmlFor={domain.getName()}
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
              id={domain.getName()}
              onClick={() => !disabled && setIsOpen(true)}
              onKeyDown={(e) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                  setIsOpen(true);
                }
              }}
              className={cn(
                'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full items-center justify-start rounded-md border py-2 pr-3 pl-3 text-left text-sm font-normal focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none',
                !value && 'text-muted-foreground',
                errorMessage && 'border-destructive text-destructive-foreground focus-visible:ring-destructive',
                disabled && 'cursor-not-allowed bg-gray-300/20 opacity-50',
                !disabled && 'hover:bg-accent hover:text-accent-foreground',
                (clearable && value && !disabled && nullable) || isErrorIconVisible ? 'pr-10' : 'pr-3',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="flex-1 truncate">{value ? format(value, 'MMMM d, yyyy') : placeholder}</span>
              <div className="absolute right-0 flex items-center pr-3">
                {isErrorIconVisible
                  ? errorInfoElement
                  : clearable &&
                    value &&
                    !disabled &&
                    nullable && (
                      <button
                        type="button"
                        onClick={handleClearDate}
                        className="focus:ring-ring inline-flex items-center justify-center rounded-full focus:ring-2 focus:ring-offset-2 focus:outline-none"
                        aria-label="Clear date"
                      >
                        <X className="text-muted-foreground hover:text-foreground h-4 w-4" />
                      </button>
                    )}
              </div>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-auto scale-95 transform p-0 transition-transform duration-200 ease-in-out" align="start">
            <Calendar
              mode="single"
              selected={value ?? undefined}
              onSelect={handleDateSelect}
              disabled={(date) => {
                const today = startOfDay(new Date());
                const currentDate = startOfDay(date);
                let isDisabled = currentDate < today;
                if (minDate && currentDate < startOfDay(minDate)) isDisabled = true;
                if (maxDate && currentDate > startOfDay(maxDate)) isDisabled = true;
                return isDisabled;
              }}
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
