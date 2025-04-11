import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import React, { useState } from 'react';

interface TimePickerProps {
  onChange: (time: string) => void;
}

export const TimePicker: React.FC<TimePickerProps> = ({ onChange }) => {
  const [hour, setHour] = useState<string>('12');
  const [minute, setMinute] = useState<string>('00');
  const [period, setPeriod] = useState<string>('AM');
  const [isOpen, setIsOpen] = useState(false);

  const handleTimeChange = () => {
    const formattedTime = `${hour}:${minute} ${period}`;
    onChange(formattedTime);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          {`${hour}:${minute} ${period}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <Select
              value={hour}
              onValueChange={(value) => {
                setHour(value);
                handleTimeChange();
              }}
            >
              <SelectTrigger className="w-16">
                <SelectValue placeholder="Hour" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0')).map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            :
            <Select
              value={minute}
              onValueChange={(value) => {
                setMinute(value);
                handleTimeChange();
              }}
            >
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
          <div className="flex items-center gap-2">
            <Select
              value={period}
              onValueChange={(value) => {
                setPeriod(value);
                handleTimeChange();
              }}
            >
              <SelectTrigger className="w-16">
                <SelectValue placeholder="AM/PM" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AM">AM</SelectItem>
                <SelectItem value="PM">PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
