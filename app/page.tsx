"use client";
import { Header } from "@/components/header";
import { NewTransactionForm } from "@/components/new-transaction-form";
import { SummaryCards } from "@/components/summary-cards";
import { TransactionList } from "@/components/transaction-list";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabase";
import { Transaction } from "@/types";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [transacoes, setTransacoes] = useState<Transaction[]>([]);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  async function fetchTransacoes() {
    const { data } = await supabase
      .from("transactions")
      .select("*")
      .order("date", { ascending: false });
    setTransacoes(data || []);
  }

  async function handleSalvar(dadosDoFormulario: any) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("transactions")
      .insert({ ...dadosDoFormulario, user_id: user.id });
    if (error) {
      console.error(error);
      alert("Erro ao salvar");
    } else {
      await fetchTransacoes();
    }
  }

  async function handleExcluir(id: string) {
    await supabase.from("transactions").delete().eq("id", id);
    fetchTransacoes();
  }

  useEffect(() => {
    async function checkUser() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
      } else {
        await fetchTransacoes();
        setIsLoadingUser(false);
      }
    }
    checkUser();
  }, []);

  if (isLoadingUser) {
    return (
      <main className="min-h-screen w-full bg-zinc-50 p-4 md:p-8 overflow-x-hidden">
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded bg-zinc-200" />
              <Skeleton className="h-6 w-32 bg-zinc-200" />
            </div>
            <Skeleton className="h-9 w-20 bg-zinc-200" />
          </div>
          {/* Skeleton dos Cards de Resumo */}
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-[120px] w-full rounded-xl bg-zinc-200" />
            <Skeleton className="h-[120px] w-full rounded-xl bg-zinc-200" />
            <Skeleton className="h-[120px] w-full rounded-xl bg-zinc-200" />
          </div>

          {/* Skeleton do Formulário e da Tabela */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:gap-8">
            {/* Lado Esquerdo (Formulário) */}
            <div className="md:col-span-4">
              <Skeleton className="h-[400px] w-full rounded-xl bg-zinc-200" />
            </div>
            {/* Lado Direito (Lista) */}
            <div className="md:col-span-8">
              <Skeleton className="h-[400px] w-full rounded-xl bg-zinc-200" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-2 sm:p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* CABEÇALHO */}
        <Header />

        {/* CARDS DE RESUMO */}
        <SummaryCards transacoes={transacoes} />

        {/* ÁREA PRINCIPAL: FORMULÁRIO E TABELA */}
        <div className="grid gap-4 md:grid-cols-12">
          {/* COLUNA DA ESQUERDA: NOVA TRANSAÇÃO */}
          <NewTransactionForm onSave={handleSalvar} />

          {/* COLUNA DA DIREITA: HISTÓRICO */}
          <TransactionList transacoes={transacoes} onDelete={handleExcluir} limit={7} />
        </div>
      </div>
    </main>
  );
}
