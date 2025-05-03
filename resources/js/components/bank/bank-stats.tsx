import { TransactionStats } from './bank_presenter';

interface BankStatsProps {
  stats: TransactionStats;
}

/**
 * Displays bank statistics including total earned, spent, and net balance
 */
export const BankStats = ({ stats }: BankStatsProps) => {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded-lg bg-green-50 p-3">
        <div className="text-sm text-green-600">Total Earned</div>
        <div className="text-xl font-bold text-green-700">+{stats.total_earned}</div>
      </div>
      <div className="rounded-lg bg-red-50 p-3">
        <div className="text-sm text-red-600">Total Spent</div>
        <div className="text-xl font-bold text-red-700">{stats.total_spent}</div>
      </div>
    </div>
  );
};
