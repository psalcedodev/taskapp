import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import { TriangleAlert } from 'lucide-react';
import React from 'react';
import { FieldDescriptionInfo } from './field_description_info';
import { FieldErrorInfo } from './field_error_info';

export interface DDCheckboxFieldProps {
  domain: FieldDomain<boolean>;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  labelEndAdornment?: React.ReactNode;
  hideLabel?: boolean;
  labelClassName?: string;
  inline?: boolean;
  checkboxClassName?: string;
  reverse?: boolean;
}

export const DDCheckboxField: React.FC<DDCheckboxFieldProps> = ({
  domain,
  startAdornment,
  endAdornment,
  labelEndAdornment,
  hideLabel,
  labelClassName,
  inline,
  checkboxClassName,
  reverse = false,
}) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const value = domain.getValue();
  const name = domain.getName();
  const label = domain.getLabel();
  const disabled = domain.getIsDisabled();
  const description = domain.getDescription();

  const descriptionInfoElement = <FieldDescriptionInfo description={description} />;
  const errorInfoElement = <FieldErrorInfo errorMessage={errorMessage} />;

  const checkboxElement = (
    <Checkbox
      id={name}
      checked={value}
      onCheckedChange={onChange}
      disabled={disabled}
      className={checkboxClassName}
      aria-describedby={errorMessage ? `${name}-error` : undefined}
      aria-invalid={!!errorMessage}
    />
  );

  const labelElement = (
    <Label
      htmlFor={name}
      data-slot="form-label"
      data-error={!!errorMessage}
      className={cn('data-[error=true]:text-destructive-foreground font-normal', labelClassName)}
    >
      {label}
    </Label>
  );

  return (
    <div className={cn(inline && 'flex items-center', disabled && 'cursor-not-allowed opacity-50')}>
      {!hideLabel && (
        <div className="mb-2 flex w-full justify-between">
          {reverse ? labelElement : checkboxElement}
          {reverse ? checkboxElement : labelElement}
          {labelEndAdornment && <div>{labelEndAdornment}</div>}
        </div>
      )}
      <div className="relative rounded-md">
        {startAdornment && <div className="absolute inset-y-0 left-0 flex items-center pl-3">{startAdornment}</div>}
        {endAdornment && !errorMessage && <div className="absolute inset-y-0 right-0 flex items-center pr-3">{endAdornment}</div>}
        {errorMessage && !disabled && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <TriangleAlert className="h-5 w-5 text-red-400" />
                </TooltipTrigger>
                <TooltipContent>{errorMessage}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
      {descriptionInfoElement}
      {errorInfoElement}
    </div>
  );
};
