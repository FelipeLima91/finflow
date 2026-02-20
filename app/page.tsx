"use client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { NewTransactionForm } from "@/components/new-transaction-form";
import { SummaryCards } from "@/components/summary-cards";
import { TransactionList } from "@/components/transaction-list";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { Transaction } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LocalTransactionService, SupabaseTransactionService, TransactionService } from "@/services/transactionService";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [transacoes, setTransacoes] = useState<Transaction[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  
  // Serviço dinâmico (será definido no useEffect)
  const [service, setService] = useState<TransactionService | null>(null);

  async function fetchTransacoes(svc: TransactionService) {
    const data = await svc.getAll();
    setTransacoes(data || []);
  }

  async function handleSalvar(dadosDoFormulario: any) {
    if (!service) return;
    
    try {
        await service.create(dadosDoFormulario);
        await fetchTransacoes(service);
    } catch (error) {
        console.error(error);
        alert("Erro ao salvar");
    }
  }

  async function handleExcluir(id: string) {
    if (!service) return;
    await service.delete(id);
    fetchTransacoes(service);
  }

  async function handleUpdate(id: string, transaction: Partial<Transaction>) {
    if (!service) return;

    try {
        await service.update(id, transaction);
        await fetchTransacoes(service);
    } catch (error) {
        console.error(error);
        alert("Erro ao atualizar a transação");
    }
  }

  const handleLogout = async () => {
    if (isGuest) {
        localStorage.removeItem("isGuest");
        localStorage.removeItem("finflow_guest_transactions");
        localStorage.removeItem("finflow_guest_session_start");
        router.replace("/login");
    } else {
        await supabase.auth.signOut();
        router.replace("/login");
    }
  };

  useEffect(() => {
    async function checkUser() {
      // 1. Verifica se é visitante
      const guestMode = localStorage.getItem("isGuest") === "true";
      
      if (guestMode) {
          setIsGuest(true);
          const svc = LocalTransactionService;
          setService(svc);
          await fetchTransacoes(svc);
          setIsLoadingUser(false);
          return;
      }

      // 2. Verifica se é usuário logado
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/login");
      } else {
        const svc = SupabaseTransactionService;
        setService(svc);
        await fetchTransacoes(svc);
        setIsLoadingUser(false);
      }
    }
    checkUser();
  }, [router]);

  if (isLoadingUser) {
    return (
      <main className="min-h-screen w-full bg-zinc-50 dark:bg-zinc-950 p-4 md:p-8 overflow-x-hidden">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded bg-zinc-200 dark:bg-zinc-800" />
              <Skeleton className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <Skeleton className="h-9 w-20 bg-zinc-200 dark:bg-zinc-800" />
          </div>
          {/* Skeleton dos Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-0">
            <Skeleton className="h-[70px] rounded bg-zinc-200 dark:bg-zinc-800" />
            <Skeleton className="h-[70px] rounded bg-zinc-200 dark:bg-zinc-800" />
            <Skeleton className="h-[70px] rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {/* Skeleton do Formulário e da Tabela */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0">
            <div>
              <Skeleton className="h-[400px] w-full rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="md:col-span-2 md:pl-6">
              <Skeleton className="h-[400px] w-full rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <main className="flex-1 p-2 sm:p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* CABEÇALHO */}
          <div className="flex flex-col gap-4">
            <Header isGuest={isGuest} />
            {isGuest && (
                <div className="bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 text-amber-800 dark:text-amber-200 px-4 py-2 rounded-md flex justify-between items-center text-sm">
                    <span>
                        <strong>Modo Visitante:</strong> Seus dados são salvos apenas neste navegador e expiram em 24h.
                    </span>
                    <Button variant="outline" size="sm" onClick={handleLogout} className="border-amber-300 dark:border-amber-600 hover:bg-amber-200 dark:hover:bg-amber-800/40 text-amber-900 dark:text-amber-100 h-8">
                        <LogOut className="mr-2 h-3 w-3" /> Sair
                    </Button>
                </div>
            )}
          </div>

          {/* CARDS DE RESUMO */}
          <SummaryCards transacoes={transacoes} />

          {/* ÁREA PRINCIPAL: FORMULÁRIO E TABELA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-0">
            {/* COLUNA DA ESQUERDA: NOVA TRANSAÇÃO - 1/3 */}
            <div className="relative md:pr-8">
              <NewTransactionForm onSave={handleSalvar} />
              {/* Divider vertical (desktop) */}
              <div className="hidden md:block absolute right-0 top-0 bottom-0 w-px bg-zinc-200 dark:bg-zinc-700" />
              {/* Divider horizontal (mobile) */}
              <div className="mx-4 h-px bg-zinc-200 dark:bg-zinc-700 md:hidden mt-6" />
            </div>

            {/* COLUNA DA DIREITA: HISTÓRICO - 2/3 */}
            <div className="md:col-span-2 min-w-0 md:pl-6">
              <TransactionList 
                transacoes={transacoes} 
                onDelete={handleExcluir} 
                onUpdate={handleUpdate}
                limit={7} 
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
