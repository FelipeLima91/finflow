"use client";

import { cn } from "@/lib/utils";
import { MonthOption, Period } from "@/lib/period";

interface PeriodFilterProps {
  value: Period;
  onChange: (period: Period) => void;
  options: MonthOption[];
  /** Quantos meses recentes mostrar como atalho. */
  limit?: number;
}

export function PeriodFilter({ value, onChange, options, limit = 6 }: PeriodFilterProps) {
  const visible = options.slice(0, limit);
  // Se o mês selecionado for antigo (fora dos atalhos), ele entra na lista
  // para não sumir da barra enquanto está ativo.
  const selectedHidden =
    value !== "all" && !visible.some((o) => o.value === value)
      ? options.find((o) => o.value === value)
      : undefined;

  const items: MonthOption[] = selectedHidden ? [...visible, selectedHidden] : visible;

  return (
    <div
      role="radiogroup"
      aria-label="Filtrar por período"
      className="flex w-fit max-w-full flex-wrap items-center gap-1 rounded-lg bg-muted p-1"
    >
      <FilterButton active={value === "all"} onClick={() => onChange("all")}>
        Tudo
      </FilterButton>
      {items.map((option) => (
        <FilterButton
          key={option.value}
          active={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </FilterButton>
      ))}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={active}
      onClick={onClick}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm transition-all whitespace-nowrap",
        active
          ? "bg-card font-semibold text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {children}
    </button>
  );
}
