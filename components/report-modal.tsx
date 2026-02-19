import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
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
  formatCurrency, 
  groupByCategory, 
  groupByDay, 
  CHART_COLORS, 
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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { PeriodFilterButtons } from "./period-filter-buttons";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "income" | "expense";
  transacoes: Transaction[];
  period: PeriodFilter;
  onPeriodChange: (p: PeriodFilter) => void;
  monthOptions: { value: string; label: string }[];
}

export function ReportModal({
  open,
  onOpenChange,
  type,
  transacoes,
  period,
  onPeriodChange,
  monthOptions,
}: ReportModalProps) {
  const isIncome = type === "income";
  const filteredTransacoes = useMemo(
    () => filterByPeriod(transacoes, period),
    [transacoes, period]
  );

  const dadosPizza = useMemo(
    () => groupByCategory(filteredTransacoes, type),
    [filteredTransacoes, type]
  );
  
  const dadosBarras = useMemo(
    () => groupByDay(filteredTransacoes, type, 10),
    [filteredTransacoes, type]
  );

  const totalValue = isIncome ? income(filteredTransacoes) : expense(filteredTransacoes);
  const title = isIncome ? "Relatório de Entradas" : "Relatório de Saídas";
  const Icon = isIncome ? ArrowUpCircle : ArrowDownCircle;
  const colorClass = isIncome ? "text-emerald-600" : "text-rose-600";
  const bgColorClass = isIncome ? "bg-emerald-50 dark:bg-emerald-900/20" : "bg-rose-50 dark:bg-rose-900/20";
  const totalColorClass = isIncome ? "text-emerald-700" : "text-rose-700";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={cn("flex items-center gap-2", colorClass)}>
            <Icon className="h-5 w-5" />
            {title}
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

          <div className={cn("text-center p-4 rounded-lg", bgColorClass)}>
            <p className={cn("text-sm font-medium", colorClass)}>
              Total de {isIncome ? "Entradas" : "Saídas"} ({getPeriodLabel(period, monthOptions)})
            </p>
            <p className={cn("text-3xl font-bold", totalColorClass)}>
              {formatCurrency(totalValue)}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">
              {isIncome ? "Entradas por Categoria" : "Para onde vai seu dinheiro?"}
            </h3>
            {dadosPizza.length > 0 ? (
              <div className="h-[250px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosPizza}
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      innerRadius="30%"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={{ stroke: "#666", strokeWidth: 1 }}
                    >
                      {dadosPizza.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[100px] flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                Sem dados de {isIncome ? "entradas" : "despesas"} neste período.
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium mb-3">
              {isIncome ? "Entradas por Dia" : "Gastos por Dia"} (últimos 10 registros)
            </h3>
            {dadosBarras.length > 0 ? (
              <div className="h-[180px] sm:h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosBarras}>
                    <XAxis
                      dataKey="name"
                      fontSize={10}
                      tickMargin={5}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      fontSize={10}
                      tickFormatter={(value) => `R$${value}`}
                      width={60}
                    />
                    <Tooltip
                      formatter={(value) => [formatCurrency(Number(value)), isIncome ? "Entrada" : "Gasto"]}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="total"
                      fill={isIncome ? "#10b981" : "#f43f5e"}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[100px] flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                Sem dados de {isIncome ? "entradas" : "despesas"} neste período.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Utility to fix missing 'cn' import if it was not auto-included
import { cn } from "@/lib/utils";
