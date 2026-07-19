import { Transaction } from "@/types";
import { parseLocalDate } from "@/lib/utils";

/** "all" para tudo, ou uma chave de mês no formato "YYYY-MM". */
export type Period = string;

export interface MonthOption {
  value: string;
  label: string;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

/** Chave "YYYY-MM" de uma data de transação. */
export function monthKey(date: string): string {
  const d = parseLocalDate(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  return `${MONTHS[Number(month) - 1]}/${year.slice(2)}`;
}

export function periodLabel(period: Period): string {
  return period === "all" ? "Tudo" : monthLabel(period);
}

/** Meses que possuem transação, dos mais recentes para os mais antigos. */
export function monthOptions(transacoes: Transaction[]): MonthOption[] {
  const keys = new Set(transacoes.map((t) => monthKey(t.date)));
  return Array.from(keys)
    .sort((a, b) => b.localeCompare(a))
    .map((value) => ({ value, label: monthLabel(value) }));
}

export function filterByPeriod(transacoes: Transaction[], period: Period): Transaction[] {
  if (period === "all") return transacoes;
  return transacoes.filter((t) => monthKey(t.date) === period);
}

/** Mês anterior, usado no comparativo. Null quando não há base de comparação. */
export function previousPeriod(period: Period): string | null {
  if (period === "all") return null;
  const [year, month] = period.split("-").map(Number);
  // month é 1-based; new Date(y, month - 2) cai no mês anterior.
  const d = new Date(year, month - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Variação percentual. Null quando a base é zero (divisão impossível). */
export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

// --- Agregações de dinheiro -------------------------------------------------

export const sumIncome = (t: Transaction[]) =>
  t.filter((x) => x.type === "income").reduce((acc, x) => acc + Number(x.amount), 0);

export const sumExpense = (t: Transaction[]) =>
  t.filter((x) => x.type === "expense").reduce((acc, x) => acc + Number(x.amount), 0);

export const sumBalance = (t: Transaction[]) => sumIncome(t) - sumExpense(t);

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
