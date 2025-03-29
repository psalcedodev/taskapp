import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Label } from '@/components/ui/label';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import clsx from 'clsx';
import React from 'react';
export interface DDInputFileProps {
  domain: FieldDomain<FileList | null>;
  placeholder?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  labelEndAdornment?: React.ReactNode;
}
export const DDInputFile: React.FC<DDInputFileProps> = ({ domain, placeholder, labelEndAdornment }) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const name = domain.getName();
  const label = domain.getLabel();
  const disabled = domain.getIsDisabled();

  return (
    <div className="w-full">
      <div className="flex w-full justify-between">
        <Label data-slot="form-label" data-error={!!errorMessage} className={cn('data-[error=true]:text-destructive-foreground')}>
          {label}
        </Label>
        {labelEndAdornment && <div>{labelEndAdornment}</div>}
      </div>
      <div className="relative w-full rounded-md shadow-sm">
        <input
          id={name}
          name={name}
          type="file"
          multiple
          // only accept image files like png, jpg, jpeg
          accept="image/*"
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => {
            onChange(event.target.files);
          }}
          className={clsx(
            'block w-full rounded-md border-0 py-1.5 text-gray-900 ring-1 ring-gray-300 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6',
            errorMessage && !disabled ? 'ring-red-200 focus:ring-red-300' : 'focus:ring-black/20',
            disabled && 'cursor-not-allowed bg-gray-300/20',
          )}
        />
        {errorMessage && !disabled && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-xs text-red-400">{errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
