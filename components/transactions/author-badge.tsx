"use client";

import { Profile } from "@/types";
import { cn } from "@/lib/utils";

// Tons suaves derivados dos tokens do design system, escolhidos de forma
// determinística pelo id do autor — a mesma pessoa sempre recebe a mesma cor.
const TONES = [
  "bg-primary/10 text-primary",
  "bg-income/10 text-income",
  "bg-expense/10 text-expense",
  "bg-muted text-muted-foreground",
];

function toneFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return TONES[Math.abs(hash) % TONES.length];
}

/** Duas primeiras letras do email (fallback: nome). Null quando não há autor. */
export function authorInitials(author?: Profile | null): string | null {
  if (!author) return null;
  const source = author.email || author.display_name || "";
  return source.slice(0, 2).toUpperCase() || null;
}

export function AuthorBadge({ author }: { author?: Profile | null }) {
  const initials = authorInitials(author);

  // Modo visitante (ou antes da migration): não há autor para exibir.
  if (!initials) {
    return <span className="text-xs text-muted-foreground/40">—</span>;
  }

  const title = [author?.display_name, author?.email]
    .filter(Boolean)
    .join(" · ");

  return (
    <span
      title={title}
      className={cn(
        "inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium",
        toneFor(author?.id ?? initials)
      )}
    >
      {initials}
    </span>
  );
}
