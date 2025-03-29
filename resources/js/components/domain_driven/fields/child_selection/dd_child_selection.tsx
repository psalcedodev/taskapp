import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

export interface ChildOption {
  id: string;
  value: {
    child_id: number;
    tokens: number;
  }; // child_id
  label: string; // child name
}

export interface DDChildSelectionProps {
  domain: FieldDomain<ChildOption[]>;
  options: ChildOption[];
  defaultTokens?: number;
  disabled?: boolean;
}

export const DDChildSelection = ({
  domain,
  options,
  defaultTokens = 1,
  disabled = false
}: DDChildSelectionProps) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const selectedOptions = domain.getValue() || [];
  const label = domain.getLabel();
  const isDisabled = disabled || domain.getIsDisabled();
  const description = domain.getDescription();

  // Function to handle checkbox changes
  const handleCheckboxChange = (option: ChildOption, checked: boolean) => {
    if (checked) {
      // Add the option with default tokens if not already selected
      if (!selectedOptions.some((item) => item.id === option.id)) {
        const newOption = { ...option, tokens: option.value.tokens || defaultTokens };
        onChange([...selectedOptions, newOption]);
      }
    } else {
      // Remove the option if currently selected
      onChange(selectedOptions.filter((item) => item.id !== option.id));
    }
  };

  // Function to handle token amount changes
  const handleTokenChange = (option: ChildOption, tokens: number) => {
    console.log({ option, tokens });
    const updatedOptions = selectedOptions.map(item => {
      if (item.id === option.id) {
        return { ...item, value: { ...item.value, tokens } };
      }
      return item;
    });
    onChange(updatedOptions);
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
      <div className={cn(isDisabled && 'opacity-70', 'space-y-2')}>
        {options.map((option) => {
          const isSelected = selectedOptions.some((item) => item.id === option.id);
          const selectedOption = selectedOptions.find(item => item.id === option.id);
          const tokenValue = selectedOption?.value.tokens || defaultTokens;
          return (
            <div key={option.id} className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`checkbox-${option.id}`}
                  checked={isSelected}
                  disabled={isDisabled}
                  className="h-4 w-4"
                  onCheckedChange={(checked) => handleCheckboxChange(option, !!checked)}
                />
                <Label
                  htmlFor={`checkbox-${option.id}`}
                  className={cn('cursor-pointer text-sm font-normal', isDisabled && 'opacity-70')}
                >
                  {option.label}
                </Label>
              </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`tokens-${option.id}`} className="text-sm font-normal">
                    Tokens:
                  </Label>
                  <Input
                    id={`tokens-${option.id}`}
                    type="number"
                    min={1}
                    value={tokenValue}
                    onChange={(e) => handleTokenChange(option, parseInt(e.target.value) || 1)}
                    disabled={isDisabled || !isSelected}
                    className="w-20 h-8"
                  />
                </div>
            </div>
          );
        })}
      </div>

      {(description || errorMessage) && (
        <p className={cn('text-muted-foreground mt-1 text-xs', errorMessage && 'text-destructive-foreground')}>
          {errorMessage || description}
        </p>
      )}
    </div>
  );
};
