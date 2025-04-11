import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import React from 'react';

interface DDDayOfWeekSelectorProps {
  domain: FieldDomain<string[]>;
}

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DDDayOfWeekSelector: React.FC<DDDayOfWeekSelectorProps> = ({ domain }) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const selectedDays = domain.getValue() || [];
  const label = domain.getLabel();
  const isDisabled = domain.getIsDisabled();
  const description = domain.getDescription();

  const handleDayToggle = (day: string) => {
    if (isDisabled) return;

    const newSelection = selectedDays.includes(day) ? selectedDays.filter((d) => d !== day) : [...selectedDays, day];
    onChange(newSelection);
  };

  return (
    <div className={cn('w-full space-y-2', isDisabled && 'cursor-not-allowed opacity-70')}>
      {label && (
        <Label
          data-slot="form-label"
          data-error={!!errorMessage}
          className={cn('data-[error=true]:text-destructive-foreground block', isDisabled && 'opacity-70')}
        >
          {label}
        </Label>
      )}
      <div className={cn('flex w-full flex-wrap justify-start gap-1', isDisabled && 'pointer-events-none')}>
        {weekDays.map((day) => {
          const isSelected = selectedDays.includes(day);
          return (
            <Button
              key={day}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleDayToggle(day)}
              className="h-8 w-10 px-2"
              disabled={isDisabled}
              aria-pressed={isSelected}
            >
              {day}
            </Button>
          );
        })}
      </div>
      {(description || errorMessage) && !isDisabled && (
        <p className={cn('text-muted-foreground mt-1 text-xs', errorMessage && 'text-destructive-foreground')}>{errorMessage || description}</p>
      )}
    </div>
  );
};
