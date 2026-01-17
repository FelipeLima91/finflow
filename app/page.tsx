import { Header } from "@/components/header";
import { NewTransactionForm } from "@/components/new-transaction-form";
import { SummaryCards } from "@/components/summary-cards";
import { TransactionList } from "@/components/transaction-list";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-50 p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* CABEÇALHO */}
        <Header />

        {/* CARDS DE RESUMO */}
        <SummaryCards />

        {/* ÁREA PRINCIPAL: FORMULÁRIO E TABELA */}
        <div className="grid gap-8 md:grid-cols-12">
          {/* COLUNA DA ESQUERDA: NOVA TRANSAÇÃO */}
          <NewTransactionForm />

          {/* COLUNA DA DIREITA: HISTÓRICO */}
          <TransactionList />
        </div>
      </div>
    </main>
  );
}
