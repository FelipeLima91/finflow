"use client";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { NewTransactionForm } from "@/components/new-transaction-form";
import { SummaryCards } from "@/components/summary-cards";
import { TransactionList } from "@/components/transaction-list";
import { PeriodFilter } from "@/components/period-filter";
import { MemberSummary } from "@/components/member-summary";
import {
  filterByPeriod,
  monthOptions,
  periodLabel,
  previousPeriod,
  type Period,
} from "@/lib/period";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { Transaction } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { LocalTransactionService, SupabaseTransactionService, TransactionService } from "@/services/transactionService";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [transacoes, setTransacoes] = useState<Transaction[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [period, setPeriod] = useState<Period>("all");

  // Meses disponíveis, derivados das transações existentes
  const mesesDisponiveis = useMemo(() => monthOptions(transacoes), [transacoes]);

  // Transações do período selecionado e do período anterior (para o comparativo)
  const transacoesDoPeriodo = useMemo(
    () => filterByPeriod(transacoes, period),
    [transacoes, period]
  );

  const periodoAnterior = useMemo(() => previousPeriod(period), [period]);

  const transacoesAnteriores = useMemo(
    () => (periodoAnterior ? filterByPeriod(transacoes, periodoAnterior) : []),
    [transacoes, periodoAnterior]
  );
  
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
      <main className="min-h-screen w-full bg-background p-4 md:p-8 overflow-x-hidden">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
            <Skeleton className="h-9 w-20" />
          </div>
          {/* Skeleton dos Cards de Resumo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-[88px] rounded-xl" />
            <Skeleton className="h-[88px] rounded-xl" />
            <Skeleton className="h-[88px] rounded-xl" />
          </div>

          {/* Skeleton do Formulário e da Tabela */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
            <div className="md:col-span-2">
              <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <main className="flex-1 p-3 sm:p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-8">
          {/* CABEÇALHO */}
          <div className="flex flex-col gap-4">
            <Header isGuest={isGuest} />
            {isGuest && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 px-4 py-2.5 rounded-xl flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center text-sm">
                    <span>
                        <strong className="font-semibold">Modo Visitante:</strong> Seus dados são salvos apenas neste navegador e expiram em 24h.
                    </span>
                    <Button variant="outline" size="sm" onClick={handleLogout} className="shrink-0 border-amber-300 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-100 h-8">
                        <LogOut className="mr-2 h-3 w-3" /> Sair
                    </Button>
                </div>
            )}
          </div>

          {/* FILTRO DE PERÍODO — controla cards, lista e resumo por pessoa */}
          <PeriodFilter
            value={period}
            onChange={setPeriod}
            options={mesesDisponiveis}
          />

          {/* CARDS DE RESUMO */}
          <SummaryCards
            transacoes={transacoesDoPeriodo}
            previousTransacoes={transacoesAnteriores}
            periodLabel={periodLabel(period)}
            previousLabel={periodoAnterior ? periodLabel(periodoAnterior) : null}
          />

          {/* ÁREA PRINCIPAL: FORMULÁRIO E TABELA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* COLUNA DA ESQUERDA: NOVA TRANSAÇÃO - 1/3 */}
            <div className="space-y-6">
              <div className="surface-card p-5 md:p-6">
                <NewTransactionForm onSave={handleSalvar} />
              </div>
              <MemberSummary
                transacoes={transacoesDoPeriodo}
                periodLabel={periodLabel(period)}
              />
            </div>

            {/* COLUNA DA DIREITA: HISTÓRICO - 2/3 */}
            <div className="md:col-span-2 min-w-0 surface-card p-5 md:p-6">
              <TransactionList
                transacoes={transacoesDoPeriodo}
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
