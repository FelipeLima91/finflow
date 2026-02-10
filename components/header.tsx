'use client';
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { LogOut, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";

export function Header({ isGuest }: { isGuest?: boolean }) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (isGuest) return;
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
      }
    }
    getUser();
  }, [isGuest]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          FinFlow
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400">
          Controle financeiro simples e eficiente.
        </p>
      </div>
      
      <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-4">
        {isGuest ? (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Olá, Visitante</span>
        ) : userEmail ? (
          <span className="text-sm text-zinc-500 dark:text-zinc-400">Olá, {userEmail}</span>
        ) : null}
        <Button
          variant="outline"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8"
          title={theme === "dark" ? "Modo Claro" : "Modo Escuro"}
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
        {!isGuest && (
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        )}
      </div>
    </div>
  );
}
