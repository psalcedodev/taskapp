import { ArrowDown, ArrowUp, Clock, Coins, ShoppingBag, Star, Trophy } from 'lucide-react';
import { Transaction } from './bank_presenter';

/**
 * TransactionIcon Component
 *
 * Renders an appropriate icon based on the transaction type and amount.
 * Each transaction type has a unique icon and color scheme.
 */
export const TransactionIcon = ({ type, amount }: { type: Transaction['type']; amount: number }) => {
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
