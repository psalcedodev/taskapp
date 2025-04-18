import { FieldDomain } from '@/components/domain_driven/field_domain';
import { InputNoShadow } from '@/components/ui/input_no_shadow';
import { Label } from '@/components/ui/label';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import { TriangleAlert } from 'lucide-react';
import React from 'react';

export interface DDTextFieldProps {
  domain: FieldDomain<string>;
  placeholder?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  labelEndAdornment?: React.ReactNode;
  labelClassName?: string;
}
export const DDTextField: React.FC<DDTextFieldProps> = ({ domain, placeholder, startAdornment, endAdornment, labelEndAdornment, labelClassName }) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const value = domain.getValue();
  const name = domain.getName();
  const label = domain.getLabel();
  const disabled = domain.getIsDisabled();
  const description = domain.getDescription();
  return (
    <div className="w-full">
      <div className="mb-2 flex w-full justify-between">
        <Label
          data-slot="form-label"
          data-error={!!errorMessage}
          className={cn('data-[error=true]:text-destructive-foreground flex items-center gap-2', labelClassName)}
        >
          {label}
        </Label>
        {labelEndAdornment && <div>{labelEndAdornment}</div>}
      </div>
      <div className="relative w-full">
        {startAdornment && <div className="absolute inset-y-0 left-0 flex items-center pl-3">{startAdornment}</div>}
        <InputNoShadow
          id={name}
          placeholder={placeholder}
          onChange={(event) => onChange(event.currentTarget.value)}
          value={value}
          disabled={disabled}
          name={name}
          type="text"
          aria-describedby={name}
          className={cn(disabled && 'cursor-not-allowed bg-gray-300/20', startAdornment ? 'pl-7' : 'pl-3', endAdornment ? 'pr-12' : 'pr-3', '')}
        />
        {endAdornment && !errorMessage && <div className="absolute inset-y-0 right-0 flex items-center pr-3">{endAdornment}</div>}
        {errorMessage && !disabled && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <TriangleAlert className="text-destructive-foreground h-5 w-5" />
          </div>
        )}
      </div>
      <p className={cn('text-muted-foreground mt-1 text-xs', errorMessage && 'text-destructive-foreground')}>
        {errorMessage ? errorMessage : description}
      </p>
    </div>
  );
};
