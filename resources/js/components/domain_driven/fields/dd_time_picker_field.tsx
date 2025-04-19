import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDDFieldSync } from '@/hex/use_dd_field_sync';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

interface DDTimePickerFieldProps {
  domain: FieldDomain<string>;
  placeholder?: string;
  hideLabel?: boolean;
  labelClassName?: string;
}

export const DDTimePickerField: React.FC<DDTimePickerFieldProps> = ({ domain, placeholder = 'Select a time', hideLabel, labelClassName }) => {
  const { onChange, errorMessage } = useDDFieldSync(domain);
  const value = domain.getValue();
  const label = domain.getLabel();
  const description = domain.getDescription();
  const disabled = domain.getIsDisabled();

  const [hour, setHour] = useState<string>(value?.split(':')[0] || '12');
  const [minute, setMinute] = useState<string>(value?.split(':')[1]?.split(' ')[0] || '00');
  const [isOpen, setIsOpen] = useState(false);

  const [tempHour, setTempHour] = useState<string>(hour);
  const [tempMinute, setTempMinute] = useState<string>(minute);

  const handleApply = () => {
    setHour(tempHour);
    setMinute(tempMinute);
    const formattedTime = `${tempHour}:${tempMinute}`;
    onChange(formattedTime);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <div className={cn('flex flex-col gap-2', disabled && 'cursor-not-allowed opacity-50')}>
        {!hideLabel && (
          <Label data-slot="form-label" data-error={!!errorMessage} className={cn('data-[error=true]:text-destructive-foreground', labelClassName)}>
            {label}
          </Label>
        )}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              {value || placeholder}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="z-10 w-full p-4">
            <div className="flex items-center gap-2">
              <div className="flex flex-col items-center">
                <span className="text-muted-foreground text-xs">Hours</span>
                <Select value={tempHour} onValueChange={(value) => setTempHour(value)}>
                  <SelectTrigger className="w-16">
                    <SelectValue placeholder="Hour" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0')).map((h) => (
                      <SelectItem key={h} value={h}>
                        {h}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-muted-foreground text-xs">Minutes </span>
                <Select value={tempMinute} onValueChange={(value) => setTempMinute(value)}>
                  <SelectTrigger className="w-16">
                    <SelectValue placeholder="Minute" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0')).map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="self-end" onClick={handleApply}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <p className={cn('text-muted-foreground mt-1 text-xs', errorMessage && 'text-destructive-foreground')}>
        {errorMessage ? errorMessage : description}
      </p>
    </div>
  );
};
