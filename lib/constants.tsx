import {
  Utensils,
  Repeat,
  Beer,
  Home,
  GraduationCap,
  TrendingUp,
  Gamepad2,
  ShoppingBasket,
  HeartPulse,
  Car,
  Shirt,
  Plane,
  Scissors,
  MoreHorizontal,
  Landmark,
  Banknote,
  Briefcase,
  Gift,
  RotateCcw,
  Tag,
} from "lucide-react";
import React from "react";

/**
 * Ícone de cada categoria. Mantém TODAS as categorias (entrada + saída) para
 * que a tabela consiga renderizar o ícone de qualquer lançamento antigo,
 * mesmo que a categoria já não seja oferecida para aquele tipo.
 */
export const CATEGORY_ICONS: { [key: string]: React.ReactNode } = {
  // --- Saídas ---
  Alimentação: <Utensils className="h-4 w-4" />,
  Assinaturas: <Repeat className="h-4 w-4" />,
  "Bares e Restaurantes": <Beer className="h-4 w-4" />,
  Beleza: <Scissors className="h-4 w-4" />,
  Casa: <Home className="h-4 w-4" />,
  Educação: <GraduationCap className="h-4 w-4" />,
  Lazer: <Gamepad2 className="h-4 w-4" />,
  Mercado: <ShoppingBasket className="h-4 w-4" />,
  Saúde: <HeartPulse className="h-4 w-4" />,
  Transporte: <Car className="h-4 w-4" />,
  Vestuário: <Shirt className="h-4 w-4" />,
  Viagem: <Plane className="h-4 w-4" />,

  // --- Entradas ---
  Salário: <Banknote className="h-4 w-4" />,
  Freelance: <Briefcase className="h-4 w-4" />,
  Rendimentos: <TrendingUp className="h-4 w-4" />,
  Presente: <Gift className="h-4 w-4" />,
  Reembolso: <RotateCcw className="h-4 w-4" />,
  Venda: <Tag className="h-4 w-4" />,

  // --- Fazem sentido nos dois ---
  Investimento: <TrendingUp className="h-4 w-4" />, // aporte (saída) ou resgate (entrada)
  Banco: <Landmark className="h-4 w-4" />, // tarifas (saída) ou juros (entrada)
  Outros: <MoreHorizontal className="h-4 w-4" />,
};

/** Categorias oferecidas ao lançar uma SAÍDA. */
export const EXPENSE_CATEGORIES = [
  "Alimentação",
  "Assinaturas",
  "Banco",
  "Bares e Restaurantes",
  "Beleza",
  "Casa",
  "Educação",
  "Investimento",
  "Lazer",
  "Mercado",
  "Saúde",
  "Transporte",
  "Vestuário",
  "Viagem",
  "Outros",
].sort((a, b) => a.localeCompare(b, "pt-BR"));

/** Categorias oferecidas ao lançar uma ENTRADA. */
export const INCOME_CATEGORIES = [
  "Salário",
  "Freelance",
  "Rendimentos",
  "Investimento",
  "Reembolso",
  "Presente",
  "Venda",
  "Banco",
  "Outros",
].sort((a, b) => a.localeCompare(b, "pt-BR"));

/** Lista completa — usada para lookup de ícone, não para oferecer no formulário. */
export const TRANSACTION_CATEGORIES = Object.keys(CATEGORY_ICONS).sort((a, b) =>
  a.localeCompare(b, "pt-BR")
);

/** Categorias válidas para um tipo de transação. */
export function categoriesForType(type: "income" | "expense"): string[] {
  return type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}
