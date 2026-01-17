"use client";
import { Header } from "@/components/header";
import { NewTransactionForm } from "@/components/new-transaction-form";
import { SummaryCards } from "@/components/summary-cards";
import { TransactionList } from "@/components/transaction-list";
import { supabase } from "@/lib/supabase";
import { Transaction } from "@/types";
import { useEffect, useState } from "react";


export default function Home() {
  const [transacoes, setTransacoes] = useState<Transaction[]>([]);

  async function fetchTransacoes() {
    const { data } = await supabase.from("transactions").select("*");
    setTransacoes(data || []);
  }

  async function handleSalvar(dadosDoFormulario: any) {
    await supabase.from("transactions").insert(dadosDoFormulario);
    fetchTransacoes();
  }

  useEffect(() => {
    fetchTransacoes();
  }, []);

  return (
    <main className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* CABEÇALHO */}
        <Header />

        {/* CARDS DE RESUMO */}
        <SummaryCards transacoes={transacoes} />

        {/* ÁREA PRINCIPAL: FORMULÁRIO E TABELA */}
        <div className="grid gap-8 md:grid-cols-12">
          {/* COLUNA DA ESQUERDA: NOVA TRANSAÇÃO */}
          <NewTransactionForm onSave={handleSalvar} />

          {/* COLUNA DA DIREITA: HISTÓRICO */}
          <TransactionList transacoes={transacoes} />
        </div>
      </div>
    </main>
  );
}
