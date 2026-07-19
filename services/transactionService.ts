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
    // Embute o perfil do autor via a FK transactions_author_fkey (user_id -> profiles.id).
    // A RLS já limita o resultado às transações da household do usuário logado.
    const { data, error } = await supabase
      .from("transactions")
      .select("*, author:profiles!transactions_author_fkey(id, email, display_name)")
      .order("date", { ascending: false });

    // Não engolir o erro: sem isso uma falha de RLS/schema vira "lista vazia"
    // silenciosa e fica impossível diagnosticar. Aqui só registramos (sem lançar)
    // para a tela não travar no skeleton — quem chama não trata exceção.
    if (error) {
      console.error("[finflow] Falha ao buscar transações:", error.message, error);
    }

    return (data as Transaction[]) || [];
  },

  create: async (transaction) => {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // household_id vem do DEFAULT current_household_id() no banco.
    const { error } = await supabase.from("transactions").insert({
        ...transaction,
        user_id: user.id
    });

    if (error) {
      console.error("[finflow] Falha ao criar transação:", error.message, error);
      throw new Error(error.message);
    }
  },

  update: async (id, transaction) => {
    // `author` é um objeto embutido no select, não uma coluna real — enviá-lo
    // no update faria o Postgres recusar. Mantemos também o user_id original
    // (a autoria não muda só porque outra pessoa editou).
    const fields = { ...transaction };
    delete fields.author;
    delete fields.user_id;

    const { error } = await supabase.from("transactions").update(fields).eq("id", id);
    if (error) {
      console.error("[finflow] Falha ao atualizar transação:", error.message, error);
      throw new Error(error.message);
    }
  },

  delete: async (id) => {
    const { error } = await supabase.from("transactions").delete().eq("id", id);
    if (error) {
      console.error("[finflow] Falha ao excluir transação:", error.message, error);
      throw new Error(error.message);
    }
  },
};
