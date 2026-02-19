import { Transaction } from "@/types";
import { parseLocalDate } from "@/lib/utils";

// Tipos de filtro de período
export type PeriodFilter = "all" | "30days" | "thisMonth" | string;

export const periodLabels: Record<string, string> = {
  all: "Tudo",
  "30days": "Últimos 30 dias",
  thisMonth: "Este mês",
};

export const monthLabels = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

// Cores gerais variadas para os gráficos de pizza
export const CHART_COLORS = [
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

export function getPeriodLabel(period: PeriodFilter, options: { value: string; label: string }[]): string {
  if (period === "all") return "Tudo";
  if (period === "30days") return "Últimos 30 dias";
  if (period === "thisMonth") return "Este mês";
  
  const option = options.find(opt => opt.value === period);
  return option ? option.label : period;
}

// Função para filtrar transações por período
export function filterByPeriod(transacoes: Transaction[], period: PeriodFilter): Transaction[] {
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
export const income = (transacoes: Transaction[]) =>
  transacoes
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + Number(t.amount), 0);

// Calculando as Saídas (Soma tudo que é 'expense')
export const expense = (transacoes: Transaction[]) =>
  transacoes
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + Number(t.amount), 0);

// Calculando o Saldo
export const balance = (transacoes: Transaction[]) =>
  income(transacoes) - expense(transacoes);

// Formatador de moeda
export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

// Agrupa transações por dia (limitando para responsividade)
export function groupByDay(
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
export function groupByCategory(transacoes: Transaction[], type: "income" | "expense") {
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
