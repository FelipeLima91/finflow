import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Calendar 
} from "lucide-react";
import { Transaction } from "@/types";
import { 
  PeriodFilter, 
  filterByPeriod, 
  income, 
  expense, 
  balance, 
  formatCurrency, 
  getPeriodLabel 
} from "@/lib/summary-helpers";
import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { PeriodFilterButtons } from "./period-filter-buttons";
import { cn } from "@/lib/utils";

interface BalanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transacoes: Transaction[];
  period: PeriodFilter;
  onPeriodChange: (p: PeriodFilter) => void;
  monthOptions: { value: string; label: string }[];
}

export function BalanceModal({
  open,
  onOpenChange,
  transacoes,
  period,
  onPeriodChange,
  monthOptions,
}: BalanceModalProps) {
  const filteredTransacoes = useMemo(
    () => filterByPeriod(transacoes, period),
    [transacoes, period]
  );

  const totalEntradas = income(filteredTransacoes);
  const totalSaidas = expense(filteredTransacoes);
  const saldoAtual = balance(filteredTransacoes);
  
  const dadosComparativo = [
    { name: "Entradas", valor: totalEntradas, fill: "#10b981" },
    { name: "Saídas", valor: totalSaidas, fill: "#f43f5e" },
  ];

  const isPositive = saldoAtual >= 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Balanço Financeiro
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-2">
            <Calendar className="h-4 w-4" />
            <span>Período:</span>
          </div>
          <PeriodFilterButtons 
            value={period} 
            onChange={onPeriodChange} 
            options={monthOptions} 
          />

          <div
            className={cn(
              "text-center p-6 rounded-xl",
              isPositive
                ? "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/30"
                : "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30"
            )}
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              {isPositive ? (
                <TrendingUp className="h-8 w-8 text-emerald-600" />
              ) : (
                <TrendingDown className="h-8 w-8 text-red-600" />
              )}
              <span className={cn("text-sm font-medium", isPositive ? "text-emerald-600" : "text-red-600")}>
                {isPositive ? "Saldo Positivo" : "Saldo Negativo"}
              </span>
            </div>
            <p className={cn("text-3xl sm:text-4xl font-bold", isPositive ? "text-emerald-700" : "text-red-700")}>
              {formatCurrency(saldoAtual)}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {getPeriodLabel(period, monthOptions)}
            </p>
            {totalEntradas > 0 && (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                {isPositive
                  ? `Você está economizando ${((saldoAtual / totalEntradas) * 100).toFixed(1)}% das suas entradas`
                  : `Seus gastos excedem suas entradas em ${formatCurrency(Math.abs(saldoAtual))}`}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center">
              <ArrowUpCircle className="h-5 w-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs text-emerald-600 font-medium">Entradas</p>
              <p className="text-lg font-bold text-emerald-700">
                {formatCurrency(totalEntradas)}
              </p>
            </div>
            <div className="p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-center">
              <ArrowDownCircle className="h-5 w-5 text-rose-600 mx-auto mb-1" />
              <p className="text-xs text-rose-600 font-medium">Saídas</p>
              <p className="text-lg font-bold text-rose-700">
                {formatCurrency(totalSaidas)}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">
              Comparativo Entradas vs Saídas
            </h3>
            {totalEntradas > 0 || totalSaidas > 0 ? (
              <div className="h-[150px] sm:h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosComparativo} layout="vertical">
                    <XAxis
                      type="number"
                      tickFormatter={(value) => `R$${value}`}
                      fontSize={10}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      fontSize={12}
                      width={70}
                    />
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                      {dadosComparativo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[100px] flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                Sem transações neste período.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
