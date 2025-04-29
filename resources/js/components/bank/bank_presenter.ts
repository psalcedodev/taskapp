import { AsyncActionRunner } from '@/hex/async_action_runner';
import { ObservableValue } from '@/hex/observable_value';
import { FamilyChild } from '@/types/task';

import axios from 'axios';

export type Period = 'day' | 'week' | 'month' | 'year' | 'custom';

export interface Transaction {
  id: number;
  amount: number;
  type: 'challenge_completion' | 'routine_completion' | 'purchase' | 'revert' | 'manual_adjustment' | 'streak_bonus';
  description: string;
  timestamp: string;
  relatedPurchase?: {
    id: number;
    itemName: string;
    quantity: number;
    status: string;
  };
}

export interface DailyTotal {
  date: string;
  earned: number;
  spent: number;
}

export interface TransactionStats {
  total_earned: number;
  total_spent: number;
  by_category: {
    [key: string]: {
      count: number;
      total: number;
      type: string;
    };
  };
  daily_totals: {
    [key: string]: DailyTotal;
  };
}

export class BankPresenter {
  transactions = new ObservableValue<Transaction[]>([]);
  stats = new ObservableValue<TransactionStats | null>(null);
  selectedCategory = new ObservableValue<Transaction['type'] | 'all'>('all');
  selectedPeriod = new ObservableValue<Period>('month');
  startDate = new ObservableValue<Date | null>(null);
  endDate = new ObservableValue<Date | null>(null);

  private transactionsRunner: AsyncActionRunner<void>;
  private statsRunner: AsyncActionRunner<void>;

  constructor(private child: FamilyChild) {
    this.transactionsRunner = new AsyncActionRunner<void>(undefined);
    this.statsRunner = new AsyncActionRunner<void>(undefined);

    this.loadTransactions();
    this.loadStats();
  }

  setSelectedCategory(category: Transaction['type'] | 'all') {
    this.selectedCategory.setValue(category);
    this.loadTransactions();
  }

  setPeriod(period: Period) {
    this.selectedPeriod.setValue(period);
    // Clear custom dates when switching to a preset period
    if (period !== 'custom') {
      this.startDate.setValue(null);
      this.endDate.setValue(null);
    }
    this.loadTransactions();
    this.loadStats();
  }

  setDateRange(startDate: Date, endDate: Date) {
    this.selectedPeriod.setValue('custom');
    this.startDate.setValue(startDate);
    this.endDate.setValue(endDate);
    this.loadTransactions();
    this.loadStats();
  }

  private getDateParams() {
    if (this.selectedPeriod.getValue() === 'custom' && this.startDate.getValue()) {
      return {
        start_date: this.startDate.getValue()!.toISOString().split('T')[0],
        end_date: this.endDate.getValue()?.toISOString().split('T')[0],
      };
    }
    return {
      period: this.selectedPeriod.getValue() === 'custom' ? null : this.selectedPeriod.getValue(),
    };
  }

  async loadTransactions() {
    const action = async () => {
      const response = await axios.get<Transaction[]>(route('bank.transactions', { child: this.child.id }), {
        params: {
          category: this.selectedCategory.getValue() === 'all' ? null : this.selectedCategory.getValue(),
          ...this.getDateParams(),
        },
      });
      this.transactions.setValue(response.data);
    };

    this.transactionsRunner.execute(action);
  }

  async loadStats() {
    const action = async () => {
      const response = await axios.get<TransactionStats>(route('bank.stats', { child: this.child.id }), {
        params: this.getDateParams(),
      });
      this.stats.setValue(response.data);
    };

    this.statsRunner.execute(action);
  }

  /**
   * Returns an array of { date, balance } for each day, representing the running token balance.
   * Optionally accepts a starting balance (default 0).
   */
  getRunningBalance(startingBalance = 0) {
    const stats = this.stats.getValue();
    if (!stats || !stats.daily_totals) return [];
    const dates = Object.keys(stats.daily_totals).sort(); // oldest to newest
    let balance = startingBalance;
    return dates.map((date) => {
      const { earned, spent } = stats.daily_totals[date];
      balance += earned + spent; // spent is negative
      return { date, balance };
    });
  }
}
