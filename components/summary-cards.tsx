"use client";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Cores gerais variadas para os gráficos de pizza
const CHART_COLORS = [
  "#3b82f6", // Azul
  "#22c55e", // Verde
  "#f97316", // Laranja
  "#8b5cf6", // Roxo
  "#eab308", // Amarelo
  "#ec4899", // Rosa
  "#06b6d4", // Turquesa
  "#ef4444", // Vermelho
  "#14b8a6", // Teal
  "#f59e0b", // Âmbar
  "#6366f1", // Indigo
  "#84cc16", // Lima
];

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
    { name: "Entradas", valor: totalEntradas, fill: "#10b981" },
    { name: "Saídas", valor: totalSaidas, fill: "#f43f5e" },
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

  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {/* Card Entradas - Clicável */}
        <Card
          className="min-w-0 py-3 gap-2 md:py-6 md:gap-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] hover:border-emerald-300"
          onClick={() => setEntradaOpen(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(income(transacoes))}
            </div>
            <p className="text-xs text-muted-foreground">
              Clique para ver relatório
            </p>
          </CardContent>
        </Card>

        {/* Card Saídas - Clicável */}
        <Card
          className="min-w-0 py-3 gap-2 md:py-6 md:gap-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] hover:border-rose-300"
          onClick={() => setSaidaOpen(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saídas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {formatCurrency(expense(transacoes))}
            </div>
            <p className="text-xs text-muted-foreground">
              Clique para ver relatório
            </p>
          </CardContent>
        </Card>

        {/* Card Saldo Atual - Clicável */}
        <Card
          className={`min-w-0 py-3 gap-2 md:py-6 md:gap-6 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${
            balance(transacoes) >= 0
              ? "hover:border-zinc-400 dark:hover:border-zinc-600"
              : "hover:border-red-300"
          }`}
          onClick={() => setSaldoOpen(true)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Atual</CardTitle>
            <DollarSign className="h-4 w-4 text-zinc-500 dark:text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${
                balance(transacoes) >= 0 ? "text-zinc-900 dark:text-zinc-100" : "text-red-600"
              }`}
            >
              {formatCurrency(balance(transacoes))}
            </div>
            <p className="text-xs text-muted-foreground">
              Clique para ver balanço
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Entradas */}
      <Dialog open={entradaOpen} onOpenChange={setEntradaOpen}>
        <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <ArrowUpCircle className="h-5 w-5" />
              Relatório de Entradas
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Filtro de Período */}
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-2">
              <Calendar className="h-4 w-4" />
              <span>Período:</span>
            </div>
            <PeriodFilterButtons value={entradaPeriod} onChange={setEntradaPeriod} />

            {/* Total de Entradas */}
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
              <p className="text-sm text-emerald-600 font-medium">
                Total de Entradas ({getPeriodLabel(entradaPeriod, dynamicMonthOptions)})
              </p>
              <p className="text-3xl font-bold text-emerald-700">
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
                <div className="h-[100px] flex items-center justify-center text-zinc-400 dark:text-zinc-500">
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
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[100px] flex items-center justify-center text-zinc-400 dark:text-zinc-500">
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
            <DialogTitle className="flex items-center gap-2 text-rose-600">
              <ArrowDownCircle className="h-5 w-5" />
              Relatório de Saídas
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Filtro de Período */}
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-2">
              <Calendar className="h-4 w-4" />
              <span>Período:</span>
            </div>
            <PeriodFilterButtons value={saidaPeriod} onChange={setSaidaPeriod} />

            {/* Total de Saídas */}
            <div className="text-center p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
              <p className="text-sm text-rose-600 font-medium">
                Total de Saídas ({getPeriodLabel(saidaPeriod, dynamicMonthOptions)})
              </p>
              <p className="text-3xl font-bold text-rose-700">
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
                <div className="h-[100px] flex items-center justify-center text-zinc-400 dark:text-zinc-500">
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
                        fill="#f43f5e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[100px] flex items-center justify-center text-zinc-400 dark:text-zinc-500">
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
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400 mb-2">
              <Calendar className="h-4 w-4" />
              <span>Período:</span>
            </div>
            <PeriodFilterButtons value={saldoPeriod} onChange={setSaldoPeriod} />

            {/* Indicador Grande do Saldo */}
            <div
              className={`text-center p-6 rounded-xl ${
                saldoAtual >= 0
                  ? "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/30"
                  : "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/30"
              }`}
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                {saldoAtual >= 0 ? (
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-8 w-8 text-red-600" />
                )}
                <span
                  className={`text-sm font-medium ${
                    saldoAtual >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}
                >
                  {saldoAtual >= 0 ? "Saldo Positivo" : "Saldo Negativo"}
                </span>
              </div>
              <p
                className={`text-3xl sm:text-4xl font-bold ${
                  saldoAtual >= 0 ? "text-emerald-700" : "text-red-700"
                }`}
              >
                {formatCurrency(saldoAtual)}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {getPeriodLabel(saldoPeriod, dynamicMonthOptions)}
              </p>
              {totalEntradas > 0 && (
                <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                  {saldoAtual >= 0
                    ? `Você está economizando ${((saldoAtual / totalEntradas) * 100).toFixed(1)}% das suas entradas`
                    : `Seus gastos excedem suas entradas em ${formatCurrency(Math.abs(saldoAtual))}`}
                </p>
              )}
            </div>

            {/* Resumo Rápido */}
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
                <div className="h-[100px] flex items-center justify-center text-zinc-400 dark:text-zinc-500">
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
