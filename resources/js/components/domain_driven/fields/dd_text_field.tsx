import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import { TriangleAlert } from 'lucide-react';
import React, { useState } from 'react';

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

  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="relative w-full">
      <div className="mb-2 flex w-full justify-between">{labelEndAdornment && <div>{labelEndAdornment}</div>}</div>
      <div className="relative w-full">
        {startAdornment && <div className="absolute inset-y-0 left-0 flex items-center pl-3">{startAdornment}</div>}
        <div className="relative">
          <Label
            htmlFor={name}
            className={cn(
              'text-muted-foreground absolute top-1/2 left-3 -translate-y-1/2 transform text-sm transition-all',
              (isFocused || value) && 'text-foreground top-0 -translate-y-0 text-xs',
              startAdornment && 'left-7',
            )}
          >
            {!placeholder && label}
          </Label>
          <Input
            id={name}
            placeholder={placeholder}
            onChange={(event) => onChange(event.currentTarget.value)}
            value={value}
            disabled={disabled}
            name={name}
            type="text"
            aria-describedby={name}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(disabled && 'cursor-not-allowed bg-gray-300/20', startAdornment ? 'pl-7' : 'pl-3', endAdornment ? 'pr-12' : 'pr-3', '')}
          />
        </div>
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
