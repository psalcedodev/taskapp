import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import { Loader } from 'lucide-react';
import { useCallback, useEffect } from 'react';
import { FieldDescriptionInfo } from '../field_description_info';
import { FieldErrorInfo } from '../field_error_info';

export interface Option<T> {
  id: string;
  value: T;
  label: string;
}

export interface DDSelectFieldProps<T> {
  domain: FieldDomain<Option<T>>;
  options: Option<T>[];
  loading?: boolean;
  disabled?: boolean;
  isInline?: boolean;
  labelEndAdornment?: React.ReactNode;
  labelClassName?: string;
  placeholder?: string;
}

export const DDSelectField = <T,>({
  domain,
  options,
  loading,
  isInline,
  labelEndAdornment,
  labelClassName,
  placeholder = 'Select...',
}: DDSelectFieldProps<T>) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const value = domain.getValue();
  const label = domain.getLabel();
  const name = domain.getName();
  const disabled = domain.getIsDisabled() || loading;
  const description = domain.getDescription();

  const updateCurrentOption = useCallback(() => {
    const currentOption = options.find((option) => option.id === value?.id);
    if (value && currentOption && (currentOption.id !== value.id || currentOption.label !== value.label)) {
      onChange(currentOption);
      domain.upgrade();
    }
  }, [options, value, onChange, domain]);

  useEffect(() => {
    updateCurrentOption();
  }, [updateCurrentOption]);

  const handleValueChange = (selectedId: string) => {
    const selectedOption = options.find((option) => option.id === selectedId);
    if (selectedOption) {
      onChange(selectedOption);
    }
  };

  const descriptionInfoElement = <FieldDescriptionInfo description={description} />;
  const errorInfoElement = <FieldErrorInfo errorMessage={errorMessage} />;

  return (
    <div className="w-full">
      <div className={cn('flex flex-col', isInline && 'flex-row items-center gap-4')}>
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
            {errorInfoElement}
          </div>
          {labelEndAdornment && <div>{labelEndAdornment}</div>}
        </div>

        <div className="relative flex-1">
          <Select value={value?.id ?? ''} onValueChange={handleValueChange} disabled={disabled} name={name}>
            <SelectTrigger
              id={name}
              className={cn(
                'w-full justify-between',
                errorMessage && !disabled ? 'border-destructive focus:ring-destructive' : '',
                disabled && 'opacity-50',
              )}
              aria-invalid={!!errorMessage}
            >
              {loading ? (
                <div className="flex w-full items-center justify-center">
                  <Loader className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <SelectValue placeholder={placeholder} />
              )}
            </SelectTrigger>
            <SelectContent>
              {options && options.length > 0 ? (
                <SelectGroup>
                  {options.map((option) => (
                    <SelectItem key={option.id} value={option.id} disabled={loading}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ) : (
                !loading && (
                  <SelectItem value="__no_options__" disabled>
                    No options available
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
