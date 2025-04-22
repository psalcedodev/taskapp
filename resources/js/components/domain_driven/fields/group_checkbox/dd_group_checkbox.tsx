import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import { FieldDescriptionInfo } from '../field_description_info';
import { FieldErrorInfo } from '../field_error_info';
import { Option } from '../select/dd_select_field';

export interface DDGroupCheckboxFieldProps<T> {
  domain: FieldDomain<Option<T>[]>;
  options: Option<T>[];
  isInline?: boolean;
  disabled?: boolean;
  labelEndAdornment?: React.ReactNode;
  labelClassName?: string;
}

export const DDGroupCheckboxField = <T,>({
  domain,
  options,
  isInline,
  disabled = false,
  labelEndAdornment,
  labelClassName,
}: DDGroupCheckboxFieldProps<T>) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const selectedOptions = domain.getValue() || [];
  const label = domain.getLabel();
  const isDisabled = disabled || domain.getIsDisabled();
  const description = domain.getDescription();

  const handleCheckboxChange = (option: Option<T>, checked: boolean) => {
    if (checked) {
      // Add the option if it's not already selected
      if (!selectedOptions.some((item) => item.id === option.id)) {
        onChange([...selectedOptions, option]);
      }
    } else {
      // Remove the option if it's currently selected
      onChange(selectedOptions.filter((item) => item.id !== option.id));
    }
  };

  const descriptionInfoElement = <FieldDescriptionInfo description={description} />;
  const errorInfoElement = <FieldErrorInfo errorMessage={errorMessage} />;

  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="mb-2 flex w-full items-center justify-between">
          <div className="flex items-center">
            <Label
              data-slot="form-label"
              data-error={!!errorMessage}
              className={cn('data-[error=true]:text-destructive-foreground', labelClassName, isDisabled && 'opacity-70')}
            >
              {label}
            </Label>
            {descriptionInfoElement}
            {errorInfoElement}
          </div>
          {labelEndAdornment && <div>{labelEndAdornment}</div>}
        </div>
      )}
      <div className={cn(isDisabled && 'opacity-70', isInline ? 'flex flex-wrap gap-4' : 'flex flex-col gap-2')}>
        {options.map((option) => (
          <div
            key={option.id}
            className="flex items-center space-x-2"
            onClick={() => handleCheckboxChange(option, !selectedOptions.some((item) => item.id === option.id))}
          >
            <Checkbox
              id={`checkbox-${option.id}`}
              checked={selectedOptions.some((item) => item.id === option.id)}
              disabled={isDisabled}
              className="h-4 w-4"
            />
            <Label htmlFor={`checkbox-${option.id}`} className={cn('cursor-pointer text-sm font-normal', isDisabled && 'opacity-70')}>
              {option.label}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};
