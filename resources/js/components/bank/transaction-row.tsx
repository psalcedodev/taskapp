import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Transaction } from './bank_presenter';
import { TransactionIcon } from './transaction-icon';

interface TransactionRowProps {
  transaction: Transaction;
  isLast: boolean;
}

/**
 * Displays a single transaction with its icon, timestamp, description, and amount
 */
export const TransactionRow = ({ transaction, isLast }: TransactionRowProps) => {
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
          <div className="text-sm text-gray-500">{formatDate(transaction.timestamp)}</div>
          <div className="font-medium text-gray-900">{transaction.description}</div>
        </div>
      </div>
      <div className={cn('text-lg font-semibold', transaction.amount > 0 ? 'text-green-600' : 'text-red-600')}>
        {transaction.amount > 0 ? '+' : ''}
        {transaction.amount}
      </div>
    </div>
  );
};
