import { Label } from '@/components/ui/label';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import { Switch } from '@headlessui/react';
import { Check, XIcon } from 'lucide-react';
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
export const DDSwitchField: React.FC<DDSwitchFieldProps> = ({
  domain,
  //   falseLabel = 'False',
  //   trueLabel = 'True',
  //   placeholder,
  //   startAdornment,
  //   endAdornment,
  labelEndAdornment,
  labelClassName,
  inline,
}) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);

  const value = domain.getValue();
  const label = domain.getLabel();
  const disabled = domain.getIsDisabled();
  const description = domain.getDescription();
  return (
    <div>
      <div className={cn(inline && 'flex items-center')}>
        <div className="flex w-full justify-between">
          <Label data-slot="form-label" data-error={!!errorMessage} className={cn('data-[error=true]:text-destructive-foreground', labelClassName)}>
            {label}
          </Label>
          {labelEndAdornment && <div>{labelEndAdornment}</div>}
        </div>
        <div className="relative rounded-md">
          <Switch
            disabled={disabled}
            checked={value}
            onChange={onChange}
            className={`group relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              disabled ? 'bg-gray-400' : 'bg-foreground'
            }`}
          >
            <span className="bg-background pointer-events-none relative inline-block size-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out group-data-[checked]:translate-x-5">
              <span
                aria-hidden="true"
                className="absolute inset-0 flex size-full items-center justify-center transition-opacity duration-200 ease-in group-data-[checked]:opacity-0 group-data-[checked]:duration-100 group-data-[checked]:ease-out"
              >
                <XIcon className="text-foreground size-3" />
                {/* <svg fill="none" viewBox="0 0 12 12" className="text-foreground size-3">
                <path d="M4 8l2-2m0 0l2-2M6 6L4 4m2 2l2 2" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg> */}
              </span>
              <span
                aria-hidden="true"
                className="absolute inset-0 flex size-full items-center justify-center opacity-0 transition-opacity duration-100 ease-out group-data-[checked]:opacity-100 group-data-[checked]:duration-200 group-data-[checked]:ease-in"
              >
                <Check className="text-foreground size-3" />
                {/* <svg fill="currentColor" viewBox="0 0 12 12" className={disabled ? 'size-3 text-gray-400' : 'text-foreground size-3'}>
                <path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" />
              </svg> */}
              </span>
            </span>
          </Switch>
        </div>
      </div>
      <p className={cn('text-muted-foreground mt-1 text-xs', errorMessage && 'text-destructive-foreground')}>
        {errorMessage ? errorMessage : description}
      </p>
    </div>
  );
};
