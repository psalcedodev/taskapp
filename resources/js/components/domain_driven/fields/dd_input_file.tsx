import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import React from 'react';
import { FieldDescriptionInfo } from './field_description_info';
import { FieldErrorInfo } from './field_error_info';

export interface DDInputFileProps {
  domain: FieldDomain<File | null>; // Domain holds a File object or null
  placeholder?: string;
  labelEndAdornment?: React.ReactNode;
  labelClassName?: string;
  accept?: string; // HTML accept attribute
}

export const DDInputFile: React.FC<DDInputFileProps> = ({
  domain,
  placeholder = 'Choose file...', // Changed default placeholder
  labelEndAdornment,
  labelClassName,
  accept,
}) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const value = domain.getValue(); // File object or null
  const name = domain.getName();
  const label = domain.getLabel();
  const description = domain.getDescription();
  const disabled = domain.getIsDisabled();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onChange(file || null); // Set to null if no file is selected
  };

  const descriptionInfoElement = <FieldDescriptionInfo description={description} />;
  const errorInfoElement = <FieldErrorInfo errorMessage={errorMessage} />;
  // Error icon doesn't fit well inside the file input visually,
  // so we place it next to the label.

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
          {errorInfoElement} {/* Error icon next to description */}
        </div>
        {labelEndAdornment && <div>{labelEndAdornment}</div>}
      </div>
      <Input
        id={name}
        type="file"
        onChange={handleFileChange}
        disabled={disabled}
        name={name}
        accept={accept}
        aria-describedby={`${name}-${errorMessage ? 'error' : 'description'}`}
        className={cn(disabled && 'cursor-not-allowed opacity-50', errorMessage && 'border-destructive')}
        // Placeholder is not applicable to file inputs
      />
      {/* Error/description text removed, handled by icons */}
    </div>
  );
};
