import { TRANSACTION_CATEGORIES } from "@/lib/constants";

export type TransactionCategory = keyof typeof TRANSACTION_CATEGORIES;

/** Espelho de auth.users no schema public — permite exibir quem lançou. */
export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string; // Manter string por enquanto para compatibilidade com o banco, mas idealmente seria TransactionCategory
  date: string;
  /** Quem lançou. Preenchido pelo banco (default auth.uid()). Ausente no modo visitante. */
  user_id?: string | null;
  /** Perfil do autor, embutido no select. Ausente no modo visitante. */
  author?: Profile | null;
}
