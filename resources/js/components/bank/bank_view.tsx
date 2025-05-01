/**
 * Bank View Component
 *
 * A comprehensive banking interface that displays a child's token transaction history
 * and financial statistics. Provides filtering, date range selection, and transaction
 * categorization features.
 */

import { VirtualizedList } from '@/components/ui/virtualized-list';
import { useAsyncValue } from '@/hooks/use_async_value';
import { FamilyChild } from '@/types/task';
import { Coins } from 'lucide-react';
import { useState } from 'react';
import { BankStats } from './bank-stats';
import { BankPresenter } from './bank_presenter';
import { TransactionFilters } from './transaction-filters';
import { TransactionRow } from './transaction-row';

interface BankViewProps {
  /** The child whose bank information is being displayed */
  child: FamilyChild;
  /** Callback to close the bank view */
  onClose: () => void;
  /** Callback to navigate to the shop view */
  goToShop: (child: FamilyChild) => void;
}

/**
 * TransactionRow Component
 *
 * Displays a single transaction with its details including:
 * - Transaction icon
 * - Timestamp
 * - Description
 * - Amount (with appropriate color coding for positive/negative values)
 */

/**
 * BankView Component
 *
 * Main banking interface that provides:
 * - Current token balance display
 * - Financial statistics
 * - Transaction filtering and date range selection
 * - Virtualized transaction list
 */
export const BankView = ({ child, onClose }: BankViewProps) => {
  const [presenter] = useState(() => new BankPresenter(child));

  // Async values from presenter
  const transactions = useAsyncValue(presenter.transactions);
  const stats = useAsyncValue(presenter.stats);
  const selectedCategory = useAsyncValue(presenter.selectedCategory);
  const selectedPeriod = useAsyncValue(presenter.selectedPeriod);
  const startDate = useAsyncValue(presenter.startDate);
  const endDate = useAsyncValue(presenter.endDate);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-100 bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{child.name}'s Bank</h2>
            <div className="mt-1 flex items-center gap-1.5">
              <Coins className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">{child.token_balance}</span>
              <span className="text-sm text-gray-500">tokens available</span>
            </div>
          </div>

          <TransactionFilters
            selectedPeriod={selectedPeriod}
            selectedCategory={selectedCategory}
            startDate={startDate}
            endDate={endDate}
            onPeriodChange={(period) => presenter.setPeriod(period)}
            onCategoryChange={(category) => presenter.setSelectedCategory(category)}
            onDateRangeChange={(from, to) => presenter.setDateRange(from, to)}
          />
        </div>

        {stats && <BankStats stats={stats} />}
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
