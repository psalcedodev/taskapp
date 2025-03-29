import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import { Option } from '../select/dd_select_field';

export interface DDGroupCheckboxFieldProps<T> {
  domain: FieldDomain<Option<T>[]>;
  options: Option<T>[];
  isInline?: boolean;
  disabled?: boolean;
}

export const DDGroupCheckboxField = <T,>({ domain, options, isInline, disabled = false }: DDGroupCheckboxFieldProps<T>) => {
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

  return (
    <div className="w-full space-y-2">
      {label && (
        <Label
          data-slot="form-label"
          data-error={!!errorMessage}
          className={cn('data-[error=true]:text-destructive-foreground block', isDisabled && 'opacity-70')}
        >
          {label}
        </Label>
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
            <span className={cn('cursor-pointer text-sm font-normal', isDisabled && 'opacity-70')}>{option.label}</span>
          </div>
        ))}
      </div>

      {(description || errorMessage) && (
        <p className={cn('text-muted-foreground mt-1 text-xs', errorMessage && 'text-destructive-foreground')}>{errorMessage || description}</p>
      )}
    </div>
  );
};
