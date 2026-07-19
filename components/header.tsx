'use client';
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { LogOut, Sun, Moon, Wallet, BarChart3 } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "./theme-provider";
import Link from "next/link";

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
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            FinFlow
          </h1>
          <p className="text-sm text-muted-foreground">
            Controle financeiro simples e eficiente.
          </p>
        </div>
      </div>

      <div className="flex flex-row items-center gap-2 md:gap-4">
        {isGuest ? (
          <span className="text-sm text-muted-foreground">Olá, Visitante</span>
        ) : userEmail ? (
          <span className="text-sm text-muted-foreground">Olá, {userEmail}</span>
        ) : null}
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard">
            <BarChart3 className="mr-2 h-4 w-4" />
            Relatórios
          </Link>
        </Button>
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
