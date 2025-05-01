import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Period, Transaction } from './bank_presenter';

interface TransactionFiltersProps {
  selectedPeriod: Period;
  selectedCategory: Transaction['type'] | 'all';
  startDate: Date | null;
  endDate: Date | null;
  onPeriodChange: (period: Period) => void;
  onCategoryChange: (category: Transaction['type'] | 'all') => void;
  onDateRangeChange: (from: Date, to: Date) => void;
}

const CATEGORIES = [
  { id: 'all' as const, label: 'All Activity' },
  { id: 'purchase' as const, label: 'Purchases' },
  { id: 'challenge_completion' as const, label: 'Challenges' },
  { id: 'routine_completion' as const, label: 'Routines' },
  { id: 'streak_bonus' as const, label: 'Bonuses' },
] as const;

const PERIODS: { value: Period; label: string }[] = [
  { value: 'day', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

/**
 * Provides filtering controls for transactions including:
 * - Time period selection
 * - Category filtering
 * - Custom date range selection
 */
export const TransactionFilters = ({
  selectedPeriod,
  selectedCategory,
  startDate,
  endDate,
  onPeriodChange,
  onCategoryChange,
  onDateRangeChange,
}: TransactionFiltersProps) => {
  return (
    <div className="flex items-center gap-2">
      <Select value={selectedPeriod} onValueChange={(value) => onPeriodChange(value as Period)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map((period) => (
            <SelectItem key={period.value} value={period.value}>
              {period.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedPeriod === 'custom' && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {startDate ? (
                endDate ? (
                  <>
                    {format(startDate, 'LLL dd, y')} - {format(endDate, 'LLL dd, y')}
                  </>
                ) : (
                  format(startDate, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={{ from: startDate || undefined, to: endDate || undefined }}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onDateRangeChange(range.from, range.to);
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      )}

      <Select value={selectedCategory} onValueChange={(value) => onCategoryChange(value as Transaction['type'] | 'all')}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="All Activity" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((category) => (
            <SelectItem key={category.id} value={category.id}>
              {category.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
