"use client";

import { useMemo } from "react";
import { Transaction, Profile } from "@/types";
import { formatCurrency } from "@/lib/period";
import { AuthorBadge } from "@/components/transactions/author-badge";

interface MemberSummaryProps {
  /** Transações já filtradas pelo período. */
  transacoes: Transaction[];
  periodLabel: string;
}

interface MemberTotals {
  key: string;
  author: Profile | null;
  income: number;
  expense: number;
  count: number;
}

export function MemberSummary({ transacoes, periodLabel }: MemberSummaryProps) {
  const members = useMemo(() => {
    const map = new Map<string, MemberTotals>();

    for (const t of transacoes) {
      const key = t.author?.id ?? t.user_id ?? "desconhecido";
      const entry = map.get(key) ?? {
        key,
        author: t.author ?? null,
        income: 0,
        expense: 0,
        count: 0,
      };

      if (t.type === "income") entry.income += Number(t.amount);
      else entry.expense += Number(t.amount);
      entry.count += 1;

      map.set(key, entry);
    }

    return Array.from(map.values()).sort(
      (a, b) => b.income + b.expense - (a.income + a.expense)
    );
  }, [transacoes]);

  // Só faz sentido com mais de uma pessoa lançando (some no modo visitante).
  if (members.length < 2) return null;

  return (
    <div className="surface-card p-5 md:p-6">
      <div className="mb-4 flex items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-foreground">Por pessoa</h2>
        <span className="text-xs text-muted-foreground">{periodLabel}</span>
      </div>

      <ul className="divide-y divide-border">
        {members.map((member) => (
          <li key={member.key} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
            <AuthorBadge author={member.author} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {member.author?.display_name ||
                  member.author?.email?.split("@")[0] ||
                  "Sem autor"}
              </p>
              <p className="text-xs text-muted-foreground">
                {member.count} {member.count === 1 ? "lançamento" : "lançamentos"}
              </p>
            </div>

            <div className="shrink-0 text-right tabular-nums">
              <p className="text-sm font-semibold text-expense">
                −{formatCurrency(member.expense)}
              </p>
              {member.income > 0 && (
                <p className="text-xs font-medium text-income">
                  +{formatCurrency(member.income)}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
