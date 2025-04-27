import { FieldDomain } from '@/components/domain_driven/field_domain';
import { FieldDescriptionInfo } from '@/components/domain_driven/fields/field_description_info';
import { FieldErrorInfo } from '@/components/domain_driven/fields/field_error_info';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import React from 'react';

// Use React.ComponentProps to get Textarea props type
interface DDTextareaFieldProps extends Omit<React.ComponentProps<typeof Textarea>, 'value' | 'onChange' | 'onBlur' | 'name' | 'id'> {
  domain: FieldDomain<string | null>; // Textarea typically holds string or null
  hideLabel?: boolean;
  labelClassName?: string;
  labelEndAdornment?: React.ReactNode;
}

export const DDTextareaField: React.FC<DDTextareaFieldProps> = ({
  domain,
  hideLabel,
  labelClassName,
  labelEndAdornment,
  className,
  ...rest // Pass other TextareaProps like rows, placeholder etc.
}) => {
  const value = domain.getValue();
  const name = domain.getName();
  const { onChange, onBlur, errorMessage } = useDDFieldSync(domain);
  const label = domain.getLabel();
  const description = domain.getDescription();
  const disabled = domain.getIsDisabled();

  const descriptionInfoElement = <FieldDescriptionInfo description={description} />;
  const errorInfoElement = <FieldErrorInfo errorMessage={errorMessage} />;
  const isErrorIconVisible = !!errorMessage && !disabled;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue: string | null = e.target.value;
    // Handle case where textarea is cleared
    // If domain allows null, perhaps set to null?
    // if (newValue === '') {
    //    newValue = null; // Uncomment if empty string should map to null
    // }
    onChange(newValue);
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
        <Textarea
          id={name}
          name={name}
          value={value ?? ''} // Handle null from domain
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={!!errorMessage}
          aria-describedby={errorMessage ? `${name}-error` : undefined}
          className={cn(
            className,
            errorMessage && 'border-destructive text-destructive-foreground focus-visible:ring-destructive',
            // Textarea might not need padding for error icon placement like Input
            // isErrorIconVisible && 'pr-10'
          )}
          {...rest}
        />
        {/* Error icon placement might need adjustment for Textarea if desired */}
        {/* {isErrorIconVisible && <div className="absolute right-3 top-3">{errorInfoElement}</div>} */}
      </div>
      {errorMessage && (
        <p id={`${name}-error`} className="text-destructive mt-1 text-xs">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
