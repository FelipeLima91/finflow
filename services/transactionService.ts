import { supabase } from "@/lib/supabase";
import { Transaction } from "@/types";

export interface TransactionService {
  getAll: () => Promise<Transaction[]>;
  create: (data: Omit<Transaction, "id">) => Promise<void>;
  update: (id: string, data: Partial<Transaction>) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

const LOCAL_STORAGE_KEY = "finflow_guest_transactions";
const GUEST_SESSION_KEY = "finflow_guest_session_start";

export const LocalTransactionService: TransactionService = {
  getAll: async () => {
    // Simula delay de rede
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    // Verifica expiração (24h)
    const sessionStart = localStorage.getItem(GUEST_SESSION_KEY);
    if (sessionStart) {
        const diff = Date.now() - Number(sessionStart);
        if (diff > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            localStorage.removeItem(GUEST_SESSION_KEY);
            return [];
        }
    } else {
        localStorage.setItem(GUEST_SESSION_KEY, Date.now().toString());
    }

    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  create: async (transaction) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const current = await LocalTransactionService.getAll();
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([newTransaction, ...current]));
  },

  update: async (id, transaction) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const current = await LocalTransactionService.getAll();
    const updated = current.map((t) => (t.id === id ? { ...t, ...transaction } : t));
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  },

  delete: async (id) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const current = await LocalTransactionService.getAll();
    const filtered = current.filter((t) => t.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
  },
};

export const SupabaseTransactionService: TransactionService = {
  getAll: async () => {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });
    return data || [];
  },

  create: async (transaction) => {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    await supabase.from("transactions").insert({
        ...transaction,
        user_id: user.id
    });
  },

  update: async (id, transaction) => {
    await supabase.from("transactions").update(transaction).eq("id", id);
  },

  delete: async (id) => {
    await supabase.from("transactions").delete().eq("id", id);
  },
};
