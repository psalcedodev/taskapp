import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import { TriangleAlert } from 'lucide-react';
import React from 'react';
export interface DDCheckboxFieldProps {
  domain: FieldDomain<boolean>;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  labelEndAdornment?: React.ReactNode;
  hideLabel?: boolean;
  labelClassName?: string;
  inline?: boolean;
}
export const DDCheckboxField: React.FC<DDCheckboxFieldProps> = ({
  domain,
  startAdornment,
  endAdornment,
  labelEndAdornment,
  hideLabel,
  labelClassName,
  inline,
}) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const value = domain.getValue();
  const name = domain.getName();
  const label = domain.getLabel();
  const disabled = domain.getIsDisabled();
  const description = domain.getDescription();

  return (
    <div className={cn(inline && 'flex items-center')}>
      {!hideLabel && (
        <div className="mb-2 flex w-full justify-between">
          <Label data-slot="form-label" data-error={!!errorMessage} className={cn('data-[error=true]:text-destructive-foreground', labelClassName)}>
            {label}
          </Label>
          {labelEndAdornment && <div>{labelEndAdornment}</div>}
        </div>
      )}
      <div className="relative rounded-md">
        {startAdornment && <div className="absolute inset-y-0 left-0 flex items-center pl-3">{startAdornment}</div>}
        <Checkbox name={name} checked={value} onCheckedChange={(e: boolean) => onChange(e)} disabled={disabled} />
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
      <p className={cn('text-muted-foreground mt-1 text-xs', errorMessage && 'text-destructive-foreground')}>
        {errorMessage ? errorMessage : description}
      </p>
    </div>
  );
};
