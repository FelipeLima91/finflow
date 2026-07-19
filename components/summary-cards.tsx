"use client";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Transaction } from "@/types";
import { parseLocalDate } from "@/lib/utils";
import {
  formatCurrency,
  percentChange,
  sumBalance,
  sumExpense,
  sumIncome,
} from "@/lib/period";
import { useState, useMemo } from "react";
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

interface SummaryCardsProps {
  /** Transações já filtradas pelo período selecionado. */
  transacoes: Transaction[];
  /** Transações do período anterior, para o comparativo. */
  previousTransacoes: Transaction[];
  /** Rótulo do período atual (ex: "Julho/26"). */
  periodLabel: string;
  /** Rótulo do período anterior, ou null quando não há comparação. */
  previousLabel: string | null;
}

// Paleta coesa puxando pro azul de marca (Linear/Mercury style)
const CHART_COLORS = [
  "#2563eb", "#0891b2", "#7c3aed", "#10b981", "#f59e0b", "#ec4899",
  "#14b8a6", "#6366f1", "#ef4444", "#84cc16", "#f97316", "#06b6d4",
];

// Cores semânticas de finanças (espelham os tokens --income / --expense)
const INCOME_COLOR = "#10b981";
const EXPENSE_COLOR = "#ef4444";

const CHART_TOOLTIP_STYLE = {
  backgroundColor: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  color: "var(--popover-foreground)",
};

/** Agrupa por dia, mantendo os registros mais recentes. */
function groupByDay(transacoes: Transaction[], type: "income" | "expense", maxDays = 10) {
  const grouped = transacoes
    .filter((t) => t.type === type)
    .reduce((acc, curr) => {
      const label = parseLocalDate(curr.date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
      });
      const found = acc.find((item) => item.name === label);
      if (found) found.total += Number(curr.amount);
      else acc.push({ name: label, total: Number(curr.amount) });
      return acc;
    }, [] as { name: string; total: number }[]);

  return grouped.slice(0, maxDays).reverse();
}

function groupByCategory(transacoes: Transaction[], type: "income" | "expense") {
  return transacoes
    .filter((t) => t.type === type)
    .reduce((acc, curr) => {
      const found = acc.find((item) => item.name === curr.category);
      if (found) found.value += Number(curr.amount);
      else acc.push({ name: curr.category, value: Number(curr.amount) });
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value);
}

/** Variação vs período anterior. Verde/vermelho depende do que é "bom" na métrica. */
function Delta({
  current,
  previous,
  goodWhenUp,
  previousLabel,
}: {
  current: number;
  previous: number;
  goodWhenUp: boolean;
  previousLabel: string | null;
}) {
  const change = previousLabel === null ? null : percentChange(current, previous);

  if (change === null) {
    return <span className="text-xs text-muted-foreground">sem comparação</span>;
  }

  const isUp = change >= 0;
  const isGood = isUp === goodWhenUp;

  return (
    <span className="flex flex-wrap items-center gap-1.5 text-xs">
      <span className={cn("font-semibold", isGood ? "text-income" : "text-expense")}>
        {isUp ? "▲" : "▼"} {Math.abs(change).toFixed(1).replace(".", ",")}%
      </span>
      <span className="text-muted-foreground">vs {previousLabel}</span>
    </span>
  );
}

export function SummaryCards({
  transacoes,
  previousTransacoes,
  periodLabel,
  previousLabel,
}: SummaryCardsProps) {
  const [entradaOpen, setEntradaOpen] = useState(false);
  const [saidaOpen, setSaidaOpen] = useState(false);
  const [saldoOpen, setSaldoOpen] = useState(false);

  const totalEntradas = sumIncome(transacoes);
  const totalSaidas = sumExpense(transacoes);
  const saldoAtual = sumBalance(transacoes);

  const prevEntradas = sumIncome(previousTransacoes);
  const prevSaidas = sumExpense(previousTransacoes);

  // Barras: proporção relativa entre entradas e saídas do período
  const maior = Math.max(totalEntradas, totalSaidas, 1);
  const taxaPoupanca = totalEntradas > 0 ? (saldoAtual / totalEntradas) * 100 : null;

  const dadosPizzaEntrada = useMemo(() => groupByCategory(transacoes, "income"), [transacoes]);
  const dadosBarrasEntrada = useMemo(() => groupByDay(transacoes, "income"), [transacoes]);
  const dadosPizzaSaida = useMemo(() => groupByCategory(transacoes, "expense"), [transacoes]);
  const dadosBarrasSaida = useMemo(() => groupByDay(transacoes, "expense"), [transacoes]);

  const dadosComparativo = [
    { name: "Entradas", valor: totalEntradas, fill: INCOME_COLOR },
    { name: "Saídas", valor: totalSaidas, fill: EXPENSE_COLOR },
  ];

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* ENTRADAS */}
        <SummaryCard
          label="Entradas"
          value={formatCurrency(totalEntradas)}
          valueClassName="text-income"
          icon={<ArrowUpCircle className="h-5 w-5 text-income" />}
          iconClassName="bg-income/10"
          barClassName="bg-income"
          barWidth={(totalEntradas / maior) * 100}
          onClick={() => setEntradaOpen(true)}
          footer={
            <Delta
              current={totalEntradas}
              previous={prevEntradas}
              goodWhenUp
              previousLabel={previousLabel}
            />
          }
        />

        {/* SAÍDAS */}
        <SummaryCard
          label="Saídas"
          value={formatCurrency(totalSaidas)}
          valueClassName="text-expense"
          icon={<ArrowDownCircle className="h-5 w-5 text-expense" />}
          iconClassName="bg-expense/10"
          barClassName="bg-expense"
          barWidth={(totalSaidas / maior) * 100}
          onClick={() => setSaidaOpen(true)}
          footer={
            <Delta
              current={totalSaidas}
              previous={prevSaidas}
              goodWhenUp={false}
              previousLabel={previousLabel}
            />
          }
        />

        {/* SALDO */}
        <SummaryCard
          label="Saldo"
          value={formatCurrency(saldoAtual)}
          valueClassName={saldoAtual >= 0 ? "text-foreground" : "text-expense"}
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          iconClassName="bg-primary/10"
          barClassName="bg-primary"
          barWidth={taxaPoupanca !== null ? Math.max(0, Math.min(100, taxaPoupanca)) : 0}
          onClick={() => setSaldoOpen(true)}
          footer={
            taxaPoupanca !== null ? (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  taxaPoupanca >= 0
                    ? "bg-primary/10 text-primary"
                    : "bg-expense/10 text-expense"
                )}
              >
                {taxaPoupanca >= 0
                  ? `Guardou ${taxaPoupanca.toFixed(1).replace(".", ",")}%`
                  : `Gastou ${Math.abs(taxaPoupanca).toFixed(1).replace(".", ",")}% a mais`}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">sem entradas no período</span>
            )
          }
        />
      </div>

      {/* MODAL — ENTRADAS */}
      <ReportDialog
        open={entradaOpen}
        onOpenChange={setEntradaOpen}
        title="Relatório de Entradas"
        titleClassName="text-income"
        icon={<ArrowUpCircle className="h-5 w-5" />}
        periodLabel={periodLabel}
        total={totalEntradas}
        totalClassName="bg-income/10 text-income"
        pieData={dadosPizzaEntrada}
        pieTitle="Entradas por Categoria"
        barData={dadosBarrasEntrada}
        barTitle="Entradas por Dia"
        barColor={INCOME_COLOR}
        emptyText="Sem entradas neste período."
      />

      {/* MODAL — SAÍDAS */}
      <ReportDialog
        open={saidaOpen}
        onOpenChange={setSaidaOpen}
        title="Relatório de Saídas"
        titleClassName="text-expense"
        icon={<ArrowDownCircle className="h-5 w-5" />}
        periodLabel={periodLabel}
        total={totalSaidas}
        totalClassName="bg-expense/10 text-expense"
        pieData={dadosPizzaSaida}
        pieTitle="Para onde vai seu dinheiro?"
        barData={dadosBarrasSaida}
        barTitle="Gastos por Dia"
        barColor={EXPENSE_COLOR}
        emptyText="Sem despesas neste período."
      />

      {/* MODAL — SALDO */}
      <Dialog open={saldoOpen} onOpenChange={setSaldoOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Balanço · {periodLabel}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            <div
              className={cn(
                "rounded-xl border p-6 text-center",
                saldoAtual >= 0
                  ? "border-income/20 bg-income/10"
                  : "border-expense/20 bg-expense/10"
              )}
            >
              <div className="mb-2 flex items-center justify-center gap-2">
                {saldoAtual >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-income" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-expense" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    saldoAtual >= 0 ? "text-income" : "text-expense"
                  )}
                >
                  {saldoAtual >= 0 ? "Saldo Positivo" : "Saldo Negativo"}
                </span>
              </div>
              <p
                className={cn(
                  "text-3xl font-bold sm:text-4xl",
                  saldoAtual >= 0 ? "text-income" : "text-expense"
                )}
              >
                {formatCurrency(saldoAtual)}
              </p>
              {taxaPoupanca !== null && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {saldoAtual >= 0
                    ? `Você guardou ${taxaPoupanca.toFixed(1).replace(".", ",")}% das suas entradas`
                    : `Seus gastos excedem as entradas em ${formatCurrency(Math.abs(saldoAtual))}`}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-income/10 p-4 text-center">
                <ArrowUpCircle className="mx-auto mb-1 h-5 w-5 text-income" />
                <p className="text-xs font-medium text-income">Entradas</p>
                <p className="text-lg font-bold text-income">{formatCurrency(totalEntradas)}</p>
              </div>
              <div className="rounded-lg bg-expense/10 p-4 text-center">
                <ArrowDownCircle className="mx-auto mb-1 h-5 w-5 text-expense" />
                <p className="text-xs font-medium text-expense">Saídas</p>
                <p className="text-lg font-bold text-expense">{formatCurrency(totalSaidas)}</p>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-medium">Comparativo Entradas vs Saídas</h3>
              {totalEntradas > 0 || totalSaidas > 0 ? (
                <div className="h-[150px] sm:h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosComparativo} layout="vertical">
                      <XAxis type="number" tickFormatter={(v) => `R$${v}`} fontSize={10} />
                      <YAxis type="category" dataKey="name" fontSize={12} width={70} />
                      <Tooltip
                        formatter={(v) => formatCurrency(Number(v))}
                        contentStyle={CHART_TOOLTIP_STYLE}
                      />
                      <Bar dataKey="valor" radius={[0, 4, 4, 0]}>
                        {dadosComparativo.map((entry, i) => (
                          <Cell key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <EmptyChart text="Sem transações neste período." />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// --- Subcomponentes ---------------------------------------------------------

function SummaryCard({
  label,
  value,
  valueClassName,
  icon,
  iconClassName,
  barClassName,
  barWidth,
  footer,
  onClick,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  icon: React.ReactNode;
  iconClassName: string;
  barClassName: string;
  barWidth: number;
  footer: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group surface-card p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:p-5"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", iconClassName)}>
          {icon}
        </div>
      </div>

      <div className={cn("mt-3 text-2xl font-bold tracking-tight tabular-nums", valueClassName)}>
        {value}
      </div>

      <div className="mt-1.5 flex min-h-5 items-center">{footer}</div>

      <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
        <span
          className={cn("block h-full rounded-full transition-all", barClassName)}
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        Ver relatório
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </p>
    </button>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-[100px] items-center justify-center text-muted-foreground">{text}</div>
  );
}

function ReportDialog({
  open,
  onOpenChange,
  title,
  titleClassName,
  icon,
  periodLabel,
  total,
  totalClassName,
  pieData,
  pieTitle,
  barData,
  barTitle,
  barColor,
  emptyText,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  titleClassName: string;
  icon: React.ReactNode;
  periodLabel: string;
  total: number;
  totalClassName: string;
  pieData: { name: string; value: number }[];
  pieTitle: string;
  barData: { name: string; total: number }[];
  barTitle: string;
  barColor: string;
  emptyText: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className={cn("flex items-center gap-2", titleClassName)}>
            {icon}
            {title} · {periodLabel}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className={cn("rounded-lg p-4 text-center", totalClassName)}>
            <p className="text-sm font-medium">Total ({periodLabel})</p>
            <p className="text-3xl font-bold">{formatCurrency(total)}</p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium">{pieTitle}</h3>
            {pieData.length > 0 ? (
              <div className="h-[250px] sm:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      outerRadius="70%"
                      innerRadius="30%"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name} ${((percent ?? 0) * 100).toFixed(0)}%`
                      }
                      labelLine={{ stroke: "var(--muted-foreground)", strokeWidth: 1 }}
                    >
                      {pieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHART_COLORS[i % CHART_COLORS.length]}
                          stroke="var(--card)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(v) => formatCurrency(Number(v))}
                      contentStyle={CHART_TOOLTIP_STYLE}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px" }} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart text={emptyText} />
            )}
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium">{barTitle}</h3>
            {barData.length > 0 ? (
              <div className="h-[180px] sm:h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis
                      dataKey="name"
                      fontSize={10}
                      tickMargin={5}
                      angle={-45}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis fontSize={10} tickFormatter={(v) => `R$${v}`} width={60} />
                    <Tooltip
                      formatter={(v) => formatCurrency(Number(v))}
                      contentStyle={CHART_TOOLTIP_STYLE}
                    />
                    <Bar dataKey="total" fill={barColor} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyChart text={emptyText} />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
