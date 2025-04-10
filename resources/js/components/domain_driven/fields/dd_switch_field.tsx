import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import React from 'react';
import { FieldDomain } from '../field_domain';

export interface DDSwitchFieldProps {
  domain: FieldDomain<boolean>;
  placeholder?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  labelEndAdornment?: React.ReactNode;
  falseLabel?: string;
  trueLabel?: string;
  labelClassName?: string;
  inline?: boolean;
}

export const DDSwitchField: React.FC<DDSwitchFieldProps> = ({ domain, labelEndAdornment, labelClassName, inline }) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);

  const value = domain.getValue();
  const label = domain.getLabel();
  const disabled = domain.getIsDisabled();
  const description = domain.getDescription();

  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
      <div className={cn('flex items-center', inline ? 'justify-start gap-2' : 'justify-between', !inline && 'w-full')}>
        {label && (
          <Label
            data-slot="form-label"
            data-error={!!errorMessage}
            className={cn('data-[error=true]:text-destructive-foreground', labelClassName, disabled && 'opacity-70', !inline && 'flex-grow')}
          >
            {label}
          </Label>
        )}
        <Switch disabled={disabled} checked={value} onCheckedChange={onChange} />
        {labelEndAdornment && !inline && <div>{labelEndAdornment}</div>}
      </div>
      {(description || errorMessage) && (
        <p className={cn('mt-1 text-xs', errorMessage ? 'text-destructive-foreground' : 'text-muted-foreground')}>{errorMessage || description}</p>
      )}
    </div>
  );
};
