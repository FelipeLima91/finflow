'use client';
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export function Header({ isGuest }: { isGuest?: boolean }) {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);

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
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          FinFlow
        </h1>
        <p className="text-zinc-500">
          Controle financeiro simples e eficiente.
        </p>
      </div>
      
      <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:gap-4">
        {isGuest ? (
          <span className="text-sm text-zinc-500">Olá, Visitante</span>
        ) : userEmail ? (
          <span className="text-sm text-zinc-500">Olá, {userEmail}</span>
        ) : null}
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
