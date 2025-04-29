import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VirtualizedList } from '@/components/ui/virtualized-list';
import { useAsyncValue } from '@/hooks/use_async_value';
import { cn } from '@/lib/utils';
import { FamilyChild } from '@/types/task';
import { format } from 'date-fns';
import { ArrowDown, ArrowLeft, ArrowUp, Calendar as CalendarIcon, Clock, Coins, ShoppingBag, Star, Trophy } from 'lucide-react';
import { useState } from 'react';
import { BankPresenter, Period, Transaction } from './bank_presenter';
interface BankViewProps {
  child: FamilyChild;
  onClose: () => void;
  goToShop: (child: FamilyChild) => void;
}

const TransactionIcon = ({ type, amount }: { type: Transaction['type']; amount: number }) => {
  switch (type) {
    case 'challenge_completion':
      return <Trophy className="h-6 w-6" style={{ color: '#a855f7' }} />;
    case 'routine_completion':
      return <Clock className="h-6 w-6" style={{ color: '#3b82f6' }} />;
    case 'purchase':
      return <ShoppingBag className="h-6 w-6" style={{ color: '#ef4444' }} />;
    case 'streak_bonus':
      return <Star className="h-6 w-6" style={{ color: '#eab308' }} />;
    case 'manual_adjustment':
      return amount > 0 ? (
        <ArrowUp className="h-6 w-6" style={{ color: '#22c55e' }} />
      ) : (
        <ArrowDown className="h-6 w-6" style={{ color: '#ef4444' }} />
      );
    default:
      return <Coins className="h-6 w-6" style={{ color: '#6b7280' }} />;
  }
};

const TransactionRow = ({ transaction, isLast }: { transaction: Transaction; isLast: boolean }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, h:mm a');
  };

  return (
    <div
      className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-4 shadow-sm"
      style={{ marginBottom: isLast ? 0 : 16 }}
    >
      <div className="flex items-center gap-4">
        <TransactionIcon type={transaction.type} amount={transaction.amount} />
        <div>
          <div className="text-sm" style={{ color: '#6b7280' }}>
            {formatDate(transaction.timestamp)}
          </div>
          <div className="font-medium" style={{ color: '#111827' }}>
            {transaction.description}
          </div>
        </div>
      </div>
      <div className={cn('text-lg font-semibold')} style={{ color: transaction.amount > 0 ? '#16a34a' : '#dc2626' }}>
        {transaction.amount > 0 ? '+' : ''}
        {transaction.amount}
      </div>
    </div>
  );
};

export const BankView = ({ child, onClose }: BankViewProps) => {
  const [presenter] = useState(() => new BankPresenter(child));
  const transactions = useAsyncValue(presenter.transactions);
  const stats = useAsyncValue(presenter.stats);
  const selectedCategory = useAsyncValue(presenter.selectedCategory);
  const selectedPeriod = useAsyncValue(presenter.selectedPeriod);
  const startDate = useAsyncValue(presenter.startDate);
  const endDate = useAsyncValue(presenter.endDate);

  const categories = [
    { id: 'all', label: 'All Activity' },
    { id: 'purchase', label: 'Purchases' },
    { id: 'challenge_completion', label: 'Challenges' },
    { id: 'routine_completion', label: 'Routines' },
    { id: 'streak_bonus', label: 'Bonuses' },
  ];

  const periods: { value: Period; label: string }[] = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' },
  ];

  return (
    <div style={{ backgroundColor: '#fff' }} className="flex h-full flex-col">
      <div className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={onClose} className="mr-2">
              <ArrowLeft className="h-4 w-4" />
              <span className="ml-2">Back to Routine</span>
            </Button>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>
                {child.name}'s Bank
              </h2>
              <div className="mt-1 flex items-center gap-1.5">
                <Coins className="h-5 w-5" style={{ color: '#eab308' }} />
                <span className="text-2xl font-bold" style={{ color: '#111827' }}>
                  {child.token_balance}
                </span>
                <span className="text-sm" style={{ color: '#6b7280' }}>
                  tokens available
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={selectedPeriod} onValueChange={(value) => presenter.setPeriod(value as Period)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((period) => (
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
                        presenter.setDateRange(range.from, range.to);
                      }
                    }}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {stats && (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-green-50 p-3">
              <div className="text-sm" style={{ color: '#16a34a' }}>
                Total Earned
              </div>
              <div className="text-xl font-bold" style={{ color: '#15803d' }}>
                +{stats.total_earned}
              </div>
            </div>
            <div className="rounded-lg bg-red-50 p-3">
              <div className="text-sm" style={{ color: '#dc2626' }}>
                Total Spent
              </div>
              <div className="text-xl font-bold" style={{ color: '#b91c1c' }}>
                {stats.total_spent}
              </div>
            </div>
            <div className="rounded-lg bg-blue-50 p-3">
              <div className="text-sm" style={{ color: '#2563eb' }}>
                Net Balance
              </div>
              <div className="text-xl font-bold" style={{ color: '#1d4ed8' }}>
                {stats.total_earned + stats.total_spent}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex space-x-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => presenter.setSelectedCategory(category.id as Transaction['type'] | 'all')}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                selectedCategory === category.id ? 'bg-gray-900' : 'bg-gray-100 hover:bg-gray-200'
              }`}
              style={{ color: selectedCategory === category.id ? '#ffffff' : '#4b5563' }}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-6 py-4">
        {stats?.daily_totals && transactions && (
          <VirtualizedList
            className="h-full"
            itemCount={transactions.length}
            rowHeight={80}
            style={{ height: '100%' }}
            gap={8}
            renderItem={({ index, style }) => {
              const transaction = transactions[index];
              const isLast = index === transactions.length - 1;
              return (
                <div style={style}>
                  <TransactionRow transaction={transaction} isLast={isLast} />
                </div>
              );
            }}
          />
        )}
      </div>
    </div>
  );
};
