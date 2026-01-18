import { ArrowDownCircle, ArrowUpCircle, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/types";

interface SummaryCardsProps {
  transacoes: Transaction[];
}

// 1. Calculando as Entradas (Soma tudo que é 'income')
const income = (transacoes: Transaction[]) =>
  transacoes
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

// 2. Calculando as Saídas (Soma tudo que é 'expense')
const expense = (transacoes: Transaction[]) =>
  transacoes
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

// 3. Calculando o Saldo
const balance = (transacoes: Transaction[]) =>
  income(transacoes) - expense(transacoes);

export function SummaryCards({ transacoes }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="min-w-0 py-3 gap-2 md:py-6 md:gap-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Entradas</CardTitle>
          <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(income(transacoes))}
          </div>
          <p className="text-xs text-muted-foreground">
            +20.1% em relação ao mês passado
          </p>
        </CardContent>
      </Card>

      <Card className="min-w-0 py-3 gap-2 md:py-6 md:gap-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saídas</CardTitle>
          <ArrowDownCircle className="h-4 w-4 text-rose-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-rose-600">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(expense(transacoes))}
          </div>
          <p className="text-xs text-muted-foreground">
            +4% em relação ao mês passado
          </p>
        </CardContent>
      </Card>

      <Card className="min-w-0 py-3 gap-2 md:py-6 md:gap-6">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
          <DollarSign className="h-4 w-4 text-zinc-500" />
        </CardHeader>
        <CardContent>
          <div
            className={`text-2xl font-bold ${balance(transacoes) >= 0 ? "text-zinc-900" : "text-red-600"}`}
          >
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(balance(transacoes))}
          </div>
          <p className="text-xs text-muted-foreground">Disponível para uso</p>
        </CardContent>
      </Card>
    </div>
  );
}
