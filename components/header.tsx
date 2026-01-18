'use client';
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export function Header() {
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
          FinFlow
        </h1>
        <p className="text-zinc-500">
          Controle financeiro simples e eficiente.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-zinc-500">Olá, Família</span>
        <div className="h-8 w-8 rounded-full bg-zinc-200"></div>
      </div>
      <Button variant="outline" size="sm" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Sair
      </Button>
    </div>
  );
}
