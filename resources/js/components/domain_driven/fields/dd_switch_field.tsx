import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import React from 'react';
import { FieldDescriptionInfo } from './field_description_info';
import { FieldErrorInfo } from './field_error_info';

export interface DDSwitchFieldProps {
  domain: FieldDomain<boolean>;
  labelEndAdornment?: React.ReactNode;
  inline?: boolean;
  labelClassName?: string;
  switchClassName?: string;
}

export const DDSwitchField: React.FC<DDSwitchFieldProps> = ({ domain, labelEndAdornment, inline, labelClassName, switchClassName }) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const value = domain.getValue();
  const name = domain.getName();
  const label = domain.getLabel();
  const description = domain.getDescription();
  const disabled = domain.getIsDisabled();

  const descriptionInfoElement = <FieldDescriptionInfo description={description} />;
  const errorInfoElement = <FieldErrorInfo errorMessage={errorMessage} />;

  return (
    <div
      className={cn(
        'flex w-full items-center',
        inline ? 'justify-between' : 'flex-col items-start gap-2',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <div className="flex items-center">
        <Label
          htmlFor={name}
          data-slot="form-label"
          data-error={!!errorMessage}
          className={cn('data-[error=true]:text-destructive-foreground', labelClassName)}
        >
          {label}
        </Label>
        {descriptionInfoElement}
        {inline && errorInfoElement}
      </div>
      <div className="flex items-center gap-2">
        {!inline && errorInfoElement}
        <Switch
          id={name}
          checked={value}
          onCheckedChange={onChange}
          disabled={disabled}
          className={switchClassName}
          aria-describedby={errorMessage ? `${name}-error` : undefined}
          aria-invalid={!!errorMessage}
        />
        {labelEndAdornment && <div>{labelEndAdornment}</div>}
      </div>
    </div>
  );
};
