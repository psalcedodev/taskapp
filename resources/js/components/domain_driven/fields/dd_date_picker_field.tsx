import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, TriangleAlert } from 'lucide-react';
import React from 'react';

export interface DDDatePickerFieldProps {
  domain: FieldDomain<Date | null>;
  placeholder?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  labelEndAdornment?: React.ReactNode;
  hideLabel?: boolean;
  labelClassName?: string;
  nullable?: boolean;
  minDate?: Date;
  maxDate?: Date;
  isInline?: boolean;
}

export const DDDatePickerField: React.FC<DDDatePickerFieldProps> = ({
  domain,
  placeholder = 'Select a date',
  startAdornment,
  endAdornment,
  hideLabel,
  labelClassName,
  nullable = true,
  minDate,
  maxDate,
  isInline,
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

  return (
    <div className="relative w-full">
      <div className={cn('flex flex-col', isInline && 'flex-row items-center gap-4')}>
        {!hideLabel && (
          <Label data-slot="form-label" data-error={!!errorMessage} className={cn('data-[error=true]:text-destructive-foreground', labelClassName)}>
            {label}
          </Label>
        )}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              disabled={disabled}
              className={cn(
                'mt-2 w-full justify-start text-left font-normal',
                !value && 'text-muted-foreground',
                errorMessage && 'border-destructive',
                disabled && 'cursor-not-allowed bg-gray-300/20',
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {value ? format(value, 'MMMM d, yyyy') : placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto scale-95 transform p-0 transition-transform duration-200 ease-in-out" align="start">
            <Calendar
              mode="single"
              selected={value ?? undefined}
              onSelect={handleDateSelect}
              disabled={(date) => {
                if (minDate && date < minDate) return true;
                if (maxDate && date > maxDate) return true;
                return false;
              }}
              className="rounded-md border"
            />
          </PopoverContent>
        </Popover>

        {endAdornment && !errorMessage && <div className="absolute inset-y-0 right-0 flex items-center pr-3">{endAdornment}</div>}
        {errorMessage && !disabled && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <TriangleAlert className="h-5 w-5 text-red-400" />
          </div>
        )}
      </div>
      <p className={cn('text-muted-foreground mt-1 text-xs', errorMessage && 'text-destructive-foreground')}>
        {errorMessage ? errorMessage : description}
      </p>
    </div>
  );
};
