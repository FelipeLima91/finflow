import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Converte uma string de data para um objeto Date interpretando como data LOCAL.
 * 
 * O problema: `new Date("2026-02-15")` interpreta como meia-noite UTC,
 * que no Brasil (UTC-3) vira 21h do dia 14 — mostrando o dia ERRADO.
 * 
 * Esta função corrige isso tratando strings de data como horário local.
 */
export function parseLocalDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  
  // Strings no formato "YYYY-MM-DD" (10 caracteres) são interpretadas como UTC pelo JS.
  // Precisamos forçar interpretação local.
  if (dateStr.length === 10 && dateStr.includes('-')) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
  
  // Strings sem indicador de timezone (sem "Z" e sem "+/-HH:MM" no final)
  // já são tratadas como local pelo JS — OK.
  // Strings COM "Z" ou offset são tratadas corretamente pelo JS — OK.
  return new Date(dateStr);
}
