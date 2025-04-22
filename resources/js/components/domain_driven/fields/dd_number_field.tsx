import { FieldDomain } from '@/components/domain_driven/field_domain';
import { InputNoShadow } from '@/components/ui/input_no_shadow';
import { Label } from '@/components/ui/label';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import React from 'react';
import { FieldDescriptionInfo } from './field_description_info';
import { FieldErrorInfo } from './field_error_info';

export interface DDNumberFieldProps {
  domain: FieldDomain<number | null>; // Can be number or null
  placeholder?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  labelEndAdornment?: React.ReactNode;
  labelClassName?: string;
  step?: number; // HTML step attribute
  min?: number; // HTML min attribute
  max?: number; // HTML max attribute
}

export const DDNumberField: React.FC<DDNumberFieldProps> = ({
  domain,
  placeholder,
  startAdornment,
  endAdornment,
  labelEndAdornment,
  labelClassName,
  step,
  min,
  max,
}) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const value = domain.getValue();
  const name = domain.getName();
  const label = domain.getLabel();
  const description = domain.getDescription();
  const disabled = domain.getIsDisabled();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const stringValue = event.target.value;
    if (stringValue === '') {
      onChange(null); // Handle empty string as null
    } else {
      const numValue = parseFloat(stringValue);
      if (!isNaN(numValue)) {
        onChange(numValue);
      }
      // Optionally handle invalid number input (e.g., show temporary error)
    }
  };

  const descriptionInfoElement = <FieldDescriptionInfo description={description} />;
  const errorInfoElement = <FieldErrorInfo errorMessage={errorMessage} />;
  const isErrorIconVisible = !!errorMessage && !disabled;

  return (
    <div className="w-full">
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
      <div className="relative w-full">
        {startAdornment && <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">{startAdornment}</div>}
        <InputNoShadow
          id={name}
          placeholder={placeholder}
          onChange={handleInputChange}
          value={value === null || value === undefined ? '' : String(value)} // Convert null/undefined to empty string for input value
          disabled={disabled}
          name={name}
          type="number" // Use type="number"
          step={step}
          min={min}
          max={max}
          aria-describedby={`${name}-${errorMessage ? 'error' : 'description'}`}
          className={cn(
            disabled && 'cursor-not-allowed bg-gray-300/20',
            startAdornment ? 'pl-10' : 'pl-3', // Adjusted padding for potential adornment
            isErrorIconVisible || (endAdornment && !errorMessage) ? 'pr-10' : 'pr-3', // Adjust right padding
            '',
          )}
        />
        {endAdornment && !errorMessage && <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">{endAdornment}</div>}
        {isErrorIconVisible && <div className="absolute inset-y-0 right-0 flex items-center pr-3">{errorInfoElement}</div>}
      </div>
    </div>
  );
};
