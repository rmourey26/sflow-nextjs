import type { Transaction } from '@/types';

/**
 * Automatic Transaction Categorization System
 * Uses merchant name patterns and amount heuristics to classify transactions
 */

export type TransactionCategory =
  | 'income'
  | 'housing'
  | 'transportation'
  | 'food'
  | 'utilities'
  | 'healthcare'
  | 'entertainment'
  | 'shopping'
  | 'subscriptions'
  | 'financial'
  | 'other';

type CategoryRule = {
  category: TransactionCategory;
  keywords: string[];
  amountRange?: { min?: number; max?: number };
};

// Merchant pattern rules for automatic categorization
const CATEGORIZATION_RULES: CategoryRule[] = [
  // Income
  {
    category: 'income',
    keywords: ['payroll', 'salary', 'direct deposit', 'income', 'payment received', 'transfer from', 'refund', 'reimbursement'],
  },
  
  // Housing
  {
    category: 'housing',
    keywords: ['rent', 'mortgage', 'property', 'landlord', 'housing', 'apartment', 'lease', 'hoa'],
  },
  
  // Transportation
  {
    category: 'transportation',
    keywords: [
      'uber', 'lyft', 'gas', 'fuel', 'parking', 'metro', 'transit', 'subway',
      'taxi', 'shell', 'chevron', 'bp', 'exxon', 'mobil', 'car wash',
      'insurance', 'dmv', 'registration', 'toll', 'bridge',
    ],
  },
  
  // Food & Dining
  {
    category: 'food',
    keywords: [
      'restaurant', 'cafe', 'coffee', 'starbucks', 'dunkin', 'mcdonalds',
      'burger', 'pizza', 'grocery', 'whole foods', 'trader joe', 'safeway',
      'kroger', 'walmart', 'target', 'costco', 'food', 'dining', 'doordash',
      'uber eats', 'grubhub', 'instacart', 'chipotle', 'subway', 'market',
    ],
  },
  
  // Utilities
  {
    category: 'utilities',
    keywords: [
      'electric', 'power', 'gas company', 'water', 'internet', 'phone',
      'mobile', 'verizon', 'att', 't-mobile', 'comcast', 'spectrum',
      'utility', 'energy', 'bill payment', 'sewage', 'trash', 'waste',
    ],
  },
  
  // Healthcare
  {
    category: 'healthcare',
    keywords: [
      'pharmacy', 'cvs', 'walgreens', 'doctor', 'medical', 'hospital',
      'health', 'dental', 'clinic', 'urgent care', 'prescription',
      'medicine', 'insurance premium', 'copay',
    ],
  },
  
  // Entertainment
  {
    category: 'entertainment',
    keywords: [
      'netflix', 'hulu', 'disney', 'spotify', 'apple music', 'amazon prime',
      'hbo', 'theater', 'cinema', 'movie', 'concert', 'tickets', 'gaming',
      'steam', 'playstation', 'xbox', 'nintendo', 'youtube', 'gym',
      'fitness', 'peloton', 'sports', 'recreation',
    ],
  },
  
  // Shopping
  {
    category: 'shopping',
    keywords: [
      'amazon', 'ebay', 'store', 'retail', 'clothing', 'fashion', 'shoes',
      'electronics', 'best buy', 'home depot', 'lowes', 'ikea', 'furniture',
      'department store', 'mall', 'boutique', 'nordstrom', 'macys',
    ],
  },
  
  // Subscriptions
  {
    category: 'subscriptions',
    keywords: [
      'subscription', 'membership', 'monthly', 'annual fee', 'recurring',
      'adobe', 'microsoft', 'dropbox', 'icloud', 'patreon', 'onlyfans',
    ],
  },
  
  // Financial
  {
    category: 'financial',
    keywords: [
      'transfer', 'payment', 'credit card', 'loan', 'interest', 'fee',
      'atm', 'withdrawal', 'deposit', 'bank', 'finance charge', 'overdraft',
      'investment', 'savings', 'ach', 'wire',
    ],
  },
];

/**
 * Categorize a transaction based on merchant name and amount
 */
export function categorizeTransaction(transaction: Transaction): TransactionCategory {
  const merchantLower = transaction.merchant.toLowerCase();
  const amount = transaction.amount;

  // Check if already categorized
  if (transaction.category && transaction.category !== 'expense' && transaction.category !== 'income') {
    return transaction.category as TransactionCategory;
  }

  // Default categorization for positive amounts
  if (amount > 0) {
    return 'income';
  }

  // Apply rules
  for (const rule of CATEGORIZATION_RULES) {
    // Skip income rules for negative amounts
    if (rule.category === 'income' && amount < 0) {
      continue;
    }

    // Check amount range if specified
    if (rule.amountRange) {
      const absAmount = Math.abs(amount);
      if (rule.amountRange.min && absAmount < rule.amountRange.min) continue;
      if (rule.amountRange.max && absAmount > rule.amountRange.max) continue;
    }

    // Check keywords
    for (const keyword of rule.keywords) {
      if (merchantLower.includes(keyword)) {
        return rule.category;
      }
    }
  }

  return 'other';
}

/**
 * Batch categorize multiple transactions
 */
export function categorizeTransactions(transactions: Transaction[]): Array<Transaction & { category: TransactionCategory }> {
  return transactions.map((tx) => ({
    ...tx,
    category: categorizeTransaction(tx),
  }));
}

/**
 * Analyze spending by category
 */
export function analyzeSpendingByCategory(transactions: Transaction[]): Map<TransactionCategory, number> {
  const categoryTotals = new Map<TransactionCategory, number>();

  for (const transaction of transactions) {
    const category = categorizeTransaction(transaction);
    const current = categoryTotals.get(category) || 0;
    // Only count expenses (negative amounts)
    if (transaction.amount < 0) {
      categoryTotals.set(category, current + Math.abs(transaction.amount));
    }
  }

  return categoryTotals;
}

/**
 * Get top spending categories
 */
export function getTopSpendingCategories(
  transactions: Transaction[],
  limit = 5,
): Array<{ category: TransactionCategory; amount: number; percentage: number }> {
  const categoryTotals = analyzeSpendingByCategory(transactions);
  const totalSpending = Array.from(categoryTotals.values()).reduce((sum, val) => sum + val, 0);

  const sorted = Array.from(categoryTotals.entries())
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: totalSpending > 0 ? Math.round((amount / totalSpending) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  return sorted.slice(0, limit);
}

/**
 * Identify merchants with irregular spending patterns
 */
export function identifyIrregularMerchants(
  transactions: Transaction[],
): Array<{ merchant: string; avgAmount: number; lastAmount: number; variance: number }> {
  const merchantData = new Map<string, number[]>();

  // Group amounts by merchant
  for (const tx of transactions) {
    if (tx.amount >= 0) continue; // Skip income
    
    const amounts = merchantData.get(tx.merchant) || [];
    amounts.push(Math.abs(tx.amount));
    merchantData.set(tx.merchant, amounts);
  }

  // Calculate variance for merchants with multiple transactions
  const irregular: Array<{ merchant: string; avgAmount: number; lastAmount: number; variance: number }> = [];

  for (const [merchant, amounts] of merchantData.entries()) {
    if (amounts.length < 2) continue;

    const avg = amounts.reduce((sum, val) => sum + val, 0) / amounts.length;
    const variance = Math.sqrt(
      amounts.reduce((sum, val) => sum + (val - avg) ** 2, 0) / amounts.length
    );
    const lastAmount = amounts[amounts.length - 1];

    // Flag if last transaction is more than 2 std deviations from mean
    if (Math.abs(lastAmount - avg) > 2 * variance && variance > 10) {
      irregular.push({
        merchant,
        avgAmount: Math.round(avg * 100) / 100,
        lastAmount: Math.round(lastAmount * 100) / 100,
        variance: Math.round(variance * 100) / 100,
      });
    }
  }

  return irregular.sort((a, b) => Math.abs(b.lastAmount - b.avgAmount) - Math.abs(a.lastAmount - a.avgAmount));
}
