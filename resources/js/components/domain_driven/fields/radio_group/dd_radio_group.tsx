import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'; // Import RadioGroup components
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import { Option } from '../select/dd_select_field'; // Assuming Option is defined here

export interface DDRadioGroupFieldProps<T> {
  domain: FieldDomain<Option<T>>; // Domain holds a single option or undefined
  options: Option<T>[];
  disabled?: boolean;
}

export const DDRadioGroup = <T,>({ domain, options, disabled = false }: DDRadioGroupFieldProps<T>) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const selectedOption = domain.getValue(); // Get the single selected option
  const label = domain.getLabel();
  const isDisabled = disabled || domain.getIsDisabled();
  const description = domain.getDescription();

  // Handler for when the radio group value changes
  const handleValueChange = (value: string) => {
    // Find the option that matches the selected value (id)
    const newlySelectedOption = options.find((option) => option.id === value);
    if (newlySelectedOption) {
      onChange(newlySelectedOption); // Update the domain with the selected option
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
      {/* Use the RadioGroup component */}
      <RadioGroup
        value={selectedOption?.id} // Bind value to the selected option's id
        onValueChange={handleValueChange} // Handle changes
        disabled={isDisabled}
        className={cn(isDisabled && 'opacity-70', 'flex flex-col gap-2')} // Standard vertical layout
      >
        {options.map((option) => (
          <div key={option.id} className="flex items-center space-x-2">
            {/* Use RadioGroupItem for each option */}
            <RadioGroupItem value={option.id} id={`radio-${option.id}`} disabled={isDisabled} />
            <Label htmlFor={`radio-${option.id}`} className={cn('cursor-pointer font-normal', isDisabled && 'opacity-70')}>
              {option.label}
            </Label>
          </div>
        ))}
      </RadioGroup>

      {(description || errorMessage) && (
        <p className={cn('text-muted-foreground mt-1 text-xs', errorMessage && 'text-destructive-foreground')}>{errorMessage || description}</p>
      )}
    </div>
  );
};
