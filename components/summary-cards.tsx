"use client";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowRight,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Transaction } from "@/types";
import { parseLocalDate } from "@/lib/utils";
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
  transacoes: Transaction[];
}

// Paleta coesa puxando pro azul de marca (Linear/Mercury style)
const CHART_COLORS = [
  "#2563eb", // Azul (marca)
  "#0891b2", // Ciano
  "#7c3aed", // Violeta
  "#10b981", // Esmeralda
  "#f59e0b", // Âmbar
  "#ec4899", // Rosa
  "#14b8a6", // Teal
  "#6366f1", // Índigo
  "#ef4444", // Vermelho
  "#84cc16", // Lima
  "#f97316", // Laranja
  "#06b6d4", // Turquesa
];

// Cores semânticas de finanças (espelham os tokens --income / --expense)
const INCOME_COLOR = "#10b981";
const EXPENSE_COLOR = "#ef4444";

// Tipos de filtro de período
type PeriodFilter = "all" | "30days" | "thisMonth" | string;

const periodLabels: Record<string, string> = {
  all: "Tudo",
  "30days": "Últimos 30 dias",
  thisMonth: "Este mês",
};

const monthLabels = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function getPeriodLabel(period: PeriodFilter, options: { value: string; label: string }[]): string {
  if (period === "all") return "Tudo";
  if (period === "30days") return "Últimos 30 dias";
  if (period === "thisMonth") return "Este mês";
  
  const option = options.find(opt => opt.value === period);
  return option ? option.label : period;
}

// Função para filtrar transações por período
function filterByPeriod(transacoes: Transaction[], period: PeriodFilter): Transaction[] {
  if (period === "all") return transacoes;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period.includes('-')) {
    const [year, month] = period.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    return transacoes.filter((t) => {
      const date = parseLocalDate(t.date);
      return date >= firstDay && date <= lastDay;
    });
  }
  
  switch (period) {
    case "30days": {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return transacoes.filter((t) => parseLocalDate(t.date) >= thirtyDaysAgo);
    }
    case "thisMonth": {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return transacoes.filter((t) => parseLocalDate(t.date) >= firstDayOfMonth);
    }
    default:
      return transacoes;
  }
}

// Calculando as Entradas (Soma tudo que é 'income')
const income = (transacoes: Transaction[]) =>
  transacoes
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

// Calculando as Saídas (Soma tudo que é 'expense')
const expense = (transacoes: Transaction[]) =>
  transacoes
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

// Calculando o Saldo
const balance = (transacoes: Transaction[]) =>
  income(transacoes) - expense(transacoes);

// Formatador de moeda
const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

// Agrupa transações por dia (limitando para responsividade)
function groupByDay(
  transacoes: Transaction[],
  type: "income" | "expense",
  maxDays: number = 10
) {
  const filtered = transacoes.filter((t) => t.type === type);
  const grouped = filtered.reduce((acc, curr) => {
    const dataFormatada = parseLocalDate(curr.date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
    const found = acc.find((item) => item.name === dataFormatada);
    if (found) {
      found.total += Number(curr.amount);
    } else {
      acc.push({ name: dataFormatada, total: Number(curr.amount) });
    }
    return acc;
  }, [] as { name: string; total: number }[]);

  // Limita o número de dias exibidos (pega os mais recentes)
  return grouped.slice(0, maxDays).reverse();
}

// Agrupa transações por categoria
function groupByCategory(transacoes: Transaction[], type: "income" | "expense") {
  return transacoes
    .filter((t) => t.type === type)
    .reduce((acc, curr) => {
      const found = acc.find((item) => item.name === curr.category);
      if (found) {
        found.value += Number(curr.amount);
      } else {
        acc.push({ name: curr.category, value: Number(curr.amount) });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value); // Ordena por valor decrescente
}

export function SummaryCards({ transacoes }: SummaryCardsProps) {
  const [entradaOpen, setEntradaOpen] = useState(false);
  const [saidaOpen, setSaidaOpen] = useState(false);
  const [saldoOpen, setSaldoOpen] = useState(false);

  // Filtros de período para cada modal
  const [entradaPeriod, setEntradaPeriod] = useState<PeriodFilter>("30days");
  const [saidaPeriod, setSaidaPeriod] = useState<PeriodFilter>("30days");
  const [saldoPeriod, setSaldoPeriod] = useState<PeriodFilter>("30days");

  // Gera opções de meses dinamicamente com base nas transações existentes
  const dynamicMonthOptions = useMemo(() => {
    const monthsSet = new Set<string>();
    transacoes.forEach((t) => {
      const date = parseLocalDate(t.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      monthsSet.add(`${year}-${month}`);
    });

    return Array.from(monthsSet)
      .sort((a, b) => b.localeCompare(a)) // Mais recentes primeiro
      .map((ym) => {
        const [year, month] = ym.split("-");
        const monthIndex = parseInt(month, 10) - 1;
        return {
          value: ym,
          label: `${monthLabels[monthIndex]}/${year.slice(2)}`,
        };
      });
  }, [transacoes]);

  // Transações filtradas por período
  const entradaTransacoes = useMemo(
    () => filterByPeriod(transacoes, entradaPeriod),
    [transacoes, entradaPeriod]
  );
  const saidaTransacoes = useMemo(
    () => filterByPeriod(transacoes, saidaPeriod),
    [transacoes, saidaPeriod]
  );
  const saldoTransacoes = useMemo(
    () => filterByPeriod(transacoes, saldoPeriod),
    [transacoes, saldoPeriod]
  );

  // Dados para os gráficos - Entradas
  const dadosPizzaEntrada = useMemo(
    () => groupByCategory(entradaTransacoes, "income"),
    [entradaTransacoes]
  );
  const dadosBarrasEntrada = useMemo(
    () => groupByDay(entradaTransacoes, "income", 10),
    [entradaTransacoes]
  );

  // Dados para os gráficos - Saídas
  const dadosPizzaSaida = useMemo(
    () => groupByCategory(saidaTransacoes, "expense"),
    [saidaTransacoes]
  );
  const dadosBarrasSaida = useMemo(
    () => groupByDay(saidaTransacoes, "expense", 10),
    [saidaTransacoes]
  );

  // Dados para comparativo Entradas vs Saídas
  const totalEntradas = income(saldoTransacoes);
  const totalSaidas = expense(saldoTransacoes);
  const saldoAtual = balance(saldoTransacoes);
  const dadosComparativo = [
    { name: "Entradas", valor: totalEntradas, fill: INCOME_COLOR },
    { name: "Saídas", valor: totalSaidas, fill: EXPENSE_COLOR },
  ];

  // Componente de filtro de período reutilizável
  const PeriodFilterButtons = ({
    value,
    onChange,
  }: {
    value: PeriodFilter;
    onChange: (v: PeriodFilter) => void;
  }) => (
    <div className="flex flex-wrap gap-2 mb-4 items-center">
      {(["all", "30days", "thisMonth"] as const).map((period) => (
        <Button
          key={period}
          variant={value === period ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(period)}
          className="text-xs"
        >
          {periodLabels[period]}
        </Button>
      ))}

      {dynamicMonthOptions.length > 0 && (
        <select
          className="flex h-8 w-fit rounded-md border border-input bg-background px-2 py-1 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          value={value.includes("-") ? value : ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="" disabled>
            Selecionar mês...
          </option>
          {dynamicMonthOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );

  // Sub-componente reutilizável para cada item de resumo
  const SummaryCardItem = ({
    label,
    value,
    icon,
    iconClassName,
    valueClassName,
    onClick,
  }: {
    label: string;
    value: string;
    icon: React.ReactNode;
    iconClassName: string;
    valueClassName?: string;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className="group surface-card text-left p-4 md:p-5 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        Ver relatório
        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </p>
    </button>
  );

  return (
    <>
      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SummaryCardItem
          label="Entradas"
          value={formatCurrency(income(transacoes))}
          icon={<ArrowUpCircle className="h-5 w-5 text-income" />}
          iconClassName="bg-income-muted"
          valueClassName="text-income"
          onClick={() => setEntradaOpen(true)}
        />
        <SummaryCardItem
          label="Saídas"
          value={formatCurrency(expense(transacoes))}
          icon={<ArrowDownCircle className="h-5 w-5 text-expense" />}
          iconClassName="bg-expense-muted"
          valueClassName="text-expense"
          onClick={() => setSaidaOpen(true)}
        />
        <SummaryCardItem
          label="Saldo Atual"
          value={formatCurrency(balance(transacoes))}
          icon={<DollarSign className="h-5 w-5 text-primary" />}
          iconClassName="bg-accent"
          valueClassName={balance(transacoes) >= 0 ? "text-foreground" : "text-expense"}
          onClick={() => setSaldoOpen(true)}
        />
      </div>

      {/* Modal de Entradas */}
      <Dialog open={entradaOpen} onOpenChange={setEntradaOpen}>
        <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-income">
              <ArrowUpCircle className="h-5 w-5" />
              Relatório de Entradas
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Filtro de Período */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span>Período:</span>
            </div>
            <PeriodFilterButtons value={entradaPeriod} onChange={setEntradaPeriod} />

            {/* Total de Entradas */}
            <div className="text-center p-4 bg-income-muted rounded-lg">
              <p className="text-sm text-income font-medium">
                Total de Entradas ({getPeriodLabel(entradaPeriod, dynamicMonthOptions)})
              </p>
              <p className="text-3xl font-bold text-income">
                {formatCurrency(income(entradaTransacoes))}
              </p>
            </div>

            {/* Gráfico de Pizza - Entradas por Categoria */}
            <div>
              <h3 className="text-sm font-medium mb-3">Entradas por Categoria</h3>
              {dadosPizzaEntrada.length > 0 ? (
                <div className="h-[250px] sm:h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosPizzaEntrada}
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
                        {dadosPizzaEntrada.map((_, index) => (
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
                      <Legend
                        wrapperStyle={{ fontSize: "12px" }}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[100px] flex items-center justify-center text-muted-foreground">
                  Sem dados de entradas neste período.
                </div>
              )}
            </div>

            {/* Gráfico de Barras - Entradas por Dia (limitado a 10 dias) */}
            <div>
              <h3 className="text-sm font-medium mb-3">
                Entradas por Dia (últimos 10 registros)
              </h3>
              {dadosBarrasEntrada.length > 0 ? (
                <div className="h-[180px] sm:h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosBarrasEntrada}>
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
                        formatter={(value) => [
                          formatCurrency(Number(value)),
                          "Entrada",
                        ]}
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="total"
                        fill={INCOME_COLOR}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[100px] flex items-center justify-center text-muted-foreground">
                  Sem dados de entradas neste período.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Saídas */}
      <Dialog open={saidaOpen} onOpenChange={setSaidaOpen}>
        <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-expense">
              <ArrowDownCircle className="h-5 w-5" />
              Relatório de Saídas
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Filtro de Período */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span>Período:</span>
            </div>
            <PeriodFilterButtons value={saidaPeriod} onChange={setSaidaPeriod} />

            {/* Total de Saídas */}
            <div className="text-center p-4 bg-expense-muted rounded-lg">
              <p className="text-sm text-expense font-medium">
                Total de Saídas ({getPeriodLabel(saidaPeriod, dynamicMonthOptions)})
              </p>
              <p className="text-3xl font-bold text-expense">
                {formatCurrency(expense(saidaTransacoes))}
              </p>
            </div>

            {/* Gráfico de Pizza - Saídas por Categoria */}
            <div>
              <h3 className="text-sm font-medium mb-3">Para onde vai seu dinheiro?</h3>
              {dadosPizzaSaida.length > 0 ? (
                <div className="h-[250px] sm:h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dadosPizzaSaida}
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
                        {dadosPizzaSaida.map((_, index) => (
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
                      <Legend
                        wrapperStyle={{ fontSize: "12px" }}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[100px] flex items-center justify-center text-muted-foreground">
                  Sem dados de despesas neste período.
                </div>
              )}
            </div>

            {/* Gráfico de Barras - Saídas por Dia (limitado a 10 dias) */}
            <div>
              <h3 className="text-sm font-medium mb-3">
                Gastos por Dia (últimos 10 registros)
              </h3>
              {dadosBarrasSaida.length > 0 ? (
                <div className="h-[180px] sm:h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dadosBarrasSaida}>
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
                        formatter={(value) => [
                          formatCurrency(Number(value)),
                          "Gasto",
                        ]}
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar
                        dataKey="total"
                        fill={EXPENSE_COLOR}
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[100px] flex items-center justify-center text-muted-foreground">
                  Sem dados de despesas neste período.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Saldo Atual */}
      <Dialog open={saldoOpen} onOpenChange={setSaldoOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Balanço Financeiro
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Filtro de Período */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Calendar className="h-4 w-4" />
              <span>Período:</span>
            </div>
            <PeriodFilterButtons value={saldoPeriod} onChange={setSaldoPeriod} />

            {/* Indicador Grande do Saldo */}
            <div
              className={`text-center p-6 rounded-xl border ${
                saldoAtual >= 0
                  ? "bg-income-muted border-income/20"
                  : "bg-expense-muted border-expense/20"
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                {saldoAtual >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-income" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-expense" />
                )}
                <span
                  className={`text-sm font-medium ${
                    saldoAtual >= 0 ? "text-income" : "text-expense"
                  }`}
                >
                  {saldoAtual >= 0 ? "Saldo Positivo" : "Saldo Negativo"}
                </span>
              </div>
              <p
                className={`text-3xl sm:text-4xl font-bold ${
                  saldoAtual >= 0 ? "text-income" : "text-expense"
                }`}
              >
                {formatCurrency(saldoAtual)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {getPeriodLabel(saldoPeriod, dynamicMonthOptions)}
              </p>
              {totalEntradas > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {saldoAtual >= 0
                    ? `Você está economizando ${((saldoAtual / totalEntradas) * 100).toFixed(1)}% das suas entradas`
                    : `Seus gastos excedem suas entradas em ${formatCurrency(Math.abs(saldoAtual))}`}
                </p>
              )}
            </div>

            {/* Resumo Rápido */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-income-muted rounded-lg text-center">
                <ArrowUpCircle className="h-5 w-5 text-income mx-auto mb-1" />
                <p className="text-xs text-income font-medium">Entradas</p>
                <p className="text-lg font-bold text-income">
                  {formatCurrency(totalEntradas)}
                </p>
              </div>
              <div className="p-4 bg-expense-muted rounded-lg text-center">
                <ArrowDownCircle className="h-5 w-5 text-expense mx-auto mb-1" />
                <p className="text-xs text-expense font-medium">Saídas</p>
                <p className="text-lg font-bold text-expense">
                  {formatCurrency(totalSaidas)}
                </p>
              </div>
            </div>

            {/* Gráfico Comparativo */}
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
                <div className="h-[100px] flex items-center justify-center text-muted-foreground">
                  Sem transações neste período.
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
