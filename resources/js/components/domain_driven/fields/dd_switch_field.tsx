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
    <div className={cn('flex flex-col gap-1 rounded-lg border p-3 shadow-sm', disabled && 'opacity-70')}>
      <div className={cn('flex flex-row items-center', inline ? 'justify-start gap-2' : 'w-full justify-between')}>
        {label && (
          <Label
            data-slot="form-label"
            data-error={!!errorMessage}
            className={cn('data-[error=true]:text-destructive-foreground', labelClassName, disabled && 'opacity-70')}
          >
            {label}
          </Label>
        )}
        <Switch disabled={disabled} checked={value} onCheckedChange={onChange} />
        {labelEndAdornment && !inline && <div className="ml-2">{labelEndAdornment}</div>}
      </div>
      {(description || errorMessage) && (
        <p className={cn('text-xs', errorMessage ? 'text-destructive-foreground' : 'text-muted-foreground')}>{errorMessage || description}</p>
      )}
    </div>
  );
};
