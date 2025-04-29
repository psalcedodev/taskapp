import { Transaction } from './bank_presenter';

const transactionTypes = ['challenge_completion', 'routine_completion', 'purchase', 'revert', 'manual_adjustment', 'streak_bonus'] as const;

const itemNames = [
  'Toy Car',
  'Stuffed Animal',
  'LEGO Set',
  'Art Supplies',
  'Video Game',
  'Book',
  'Puzzle',
  'Board Game',
  'Sports Equipment',
  'Craft Kit',
];

const descriptions = {
  challenge_completion: [
    'Completed Math Challenge',
    'Finished Reading Challenge',
    'Completed Science Project',
    'Finished Art Challenge',
    'Completed Music Practice',
  ],
  routine_completion: ['Morning Routine', 'Homework Time', 'Cleaning Room', 'Practicing Piano', 'Reading Time'],
  purchase: itemNames,
  revert: ['Reverted Challenge Completion', 'Reverted Routine Completion', 'Reverted Purchase'],
  manual_adjustment: ['Parent Adjustment', 'Bonus Tokens', 'Token Deduction'],
  streak_bonus: ['7-Day Streak Bonus', '14-Day Streak Bonus', '30-Day Streak Bonus'],
};

export function generateMockTransactions(count: number): Transaction[] {
  const transactions: Transaction[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const type = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const description = descriptions[type][Math.floor(Math.random() * descriptions[type].length)];
    const amount = type === 'purchase' ? -Math.floor(Math.random() * 50) - 1 : Math.floor(Math.random() * 20) + 1;

    // Generate a random date within the last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(timestamp.getHours() - hoursAgo);
    timestamp.setMinutes(timestamp.getMinutes() - minutesAgo);

    const transaction: Transaction = {
      id: i + 1,
      amount,
      type,
      description,
      timestamp: timestamp.toISOString(),
    };

    // Add purchase details for purchase transactions
    if (type === 'purchase') {
      transaction.relatedPurchase = {
        id: Math.floor(Math.random() * 1000),
        itemName: itemNames[Math.floor(Math.random() * itemNames.length)],
        quantity: Math.floor(Math.random() * 3) + 1,
        status: ['approved', 'pending_approval', 'rejected'][Math.floor(Math.random() * 3)],
      };
    }

    transactions.push(transaction);
  }

  // Sort transactions by timestamp in descending order
  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
