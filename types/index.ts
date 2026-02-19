import { TRANSACTION_CATEGORIES } from "@/lib/constants";

export type TransactionCategory = keyof typeof TRANSACTION_CATEGORIES;

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string; // Manter string por enquanto para compatibilidade com o banco, mas idealmente seria TransactionCategory
  date: string;
}
