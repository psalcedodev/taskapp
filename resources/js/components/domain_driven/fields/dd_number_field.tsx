import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import { TriangleAlert } from 'lucide-react';
import React from 'react';
export interface DDNumberFieldProps {
  domain: FieldDomain<number>;
  placeholder?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  labelEndAdornment?: React.ReactNode;
  inputWidth?: number;
  minimumValue?: number;
  labelClassName?: string;
}
export const DDNumberField: React.FC<DDNumberFieldProps> = ({
  domain,
  placeholder,
  startAdornment,
  endAdornment,
  labelEndAdornment,
  labelClassName,
  minimumValue = 0,
}) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const value = domain.getValue();
  const name = domain.getName();
  const label = domain.getLabel();
  const description = domain.getDescription();
  const disabled = domain.getIsDisabled();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;

    // Allow empty input
    if (value === '') {
      onChange(undefined as unknown as number);
      return;
    }

    // Use the browser's built-in parsing to handle the various types of invalid input
    // Including expressions like -2+233 which would evaluate to 231
    const numericValue = event.currentTarget.valueAsNumber;

    // Check if input is a valid number (not NaN)
    if (!isNaN(numericValue)) {
      onChange(numericValue);
    }
  };

  const handleBlur = () => {
    // Only enforce minimum value if it's defined and there's a value to check
    if (value !== undefined && minimumValue !== undefined && value < minimumValue) {
      onChange(minimumValue);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between">
        <Label data-slot="form-label" data-error={!!errorMessage} className={cn('data-[error=true]:text-destructive-foreground', labelClassName)}>
          {label}
        </Label>
        {labelEndAdornment && <div>{labelEndAdornment}</div>}
      </div>
      <div className="relative">
        {startAdornment && <div className="absolute inset-y-0 left-0 flex items-center pl-3">{startAdornment}</div>}
        <Input
          id={name}
          placeholder={placeholder}
          onChange={handleInputChange}
          onBlur={handleBlur}
          value={value !== undefined ? value.toString() : ''}
          disabled={disabled}
          name={name}
          type="number"
          min={minimumValue}
          aria-describedby={name}
          className={cn(
            errorMessage ? 'appearance-textfield' : '',
            disabled && 'cursor-not-allowed bg-gray-300/20',
            startAdornment ? 'pl-7' : 'pl-3',
            endAdornment ? 'pr-12' : 'pr-3',
          )}
          style={
            errorMessage
              ? {
                  // Only hide spinners when there's an error
                  MozAppearance: 'textfield',
                  WebkitAppearance: 'none',
                  margin: 0,
                }
              : undefined
          }
        />
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
