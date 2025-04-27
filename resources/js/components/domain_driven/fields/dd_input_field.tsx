import { FieldDomain } from '@/components/domain_driven/field_domain';
import { FieldDescriptionInfo } from '@/components/domain_driven/fields/field_description_info';
import { FieldErrorInfo } from '@/components/domain_driven/fields/field_error_info';
import { Input } from '@/components/ui/input'; // Removed InputProps import
import { Label } from '@/components/ui/label';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import React from 'react';

// Use React.ComponentProps to get Input props type
interface DDInputFieldProps extends Omit<React.ComponentProps<typeof Input>, 'value' | 'onChange' | 'onBlur' | 'name' | 'id'> {
  domain: FieldDomain<string | number | null>; // Allow null
  hideLabel?: boolean;
  labelClassName?: string;
  labelEndAdornment?: React.ReactNode;
}

export const DDInputField: React.FC<DDInputFieldProps> = ({
  domain,
  hideLabel,
  labelClassName,
  labelEndAdornment,
  className,
  type,
  ...rest // Pass other InputProps like placeholder, min, max, step etc.
}) => {
  // Get value and name from domain directly
  const value = domain.getValue();
  const name = domain.getName();
  // Get handlers and error message from the hook
  const { onChange, onBlur, errorMessage } = useDDFieldSync(domain);

  const label = domain.getLabel();
  const description = domain.getDescription();
  const disabled = domain.getIsDisabled();

  const descriptionInfoElement = <FieldDescriptionInfo description={description} />;
  const errorInfoElement = <FieldErrorInfo errorMessage={errorMessage} />;
  const isErrorIconVisible = !!errorMessage && !disabled;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue: string | number | null = e.target.value;
    // Convert to number if the type is number and value is not empty
    if (type === 'number' && newValue !== '') {
      const num = parseFloat(newValue);
      newValue = isNaN(num) ? newValue : num; // Keep string if not a valid number
    } else if (type !== 'number' && newValue === '') {
      // Handle case where text input is cleared - might need to be null based on domain type
      // Let's assume empty string is fine unless domain specifically needs null
      // If the domain type is FieldDomain<string | null>, you might want:
      // newValue = null;
    }
    onChange(newValue as any); // Use as any briefly if TS struggles with string | number | null union
  };

  return (
    <div className={cn('w-full', disabled && 'cursor-not-allowed opacity-50')}>
      {!hideLabel && label && (
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
      <div className="relative">
        <Input
          id={name}
          name={name}
          // Ensure value passed to Input is always string or number, default to empty string
          value={value === null || value === undefined ? '' : value}
          onChange={handleChange}
          onBlur={onBlur}
          type={type}
          disabled={disabled}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? `${name}-error` : undefined}
          className={cn(
            className,
            errorMessage && 'border-destructive text-destructive-foreground focus-visible:ring-destructive',
            isErrorIconVisible && 'pr-10', // Add padding if error icon is shown
          )}
          {...rest}
        />
        {isErrorIconVisible && <div className="absolute top-1/2 right-3 -translate-y-1/2">{errorInfoElement}</div>}
      </div>
      {errorMessage && (
        <p id={`${name}-error`} className="text-destructive mt-1 text-xs">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
