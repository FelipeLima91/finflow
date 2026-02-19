'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  LayoutList, 
  PlusCircle, 
  PieChart, 
  LogOut, 
  Wallet,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    const guestMode = localStorage.getItem("isGuest") === "true";
    setIsGuest(guestMode);
  }, []);

  const handleLogout = async () => {
    if (isGuest) {
      localStorage.removeItem("isGuest");
      localStorage.removeItem("finflow_guest_transactions");
      localStorage.removeItem("finflow_guest_session_start");
      router.replace("/login");
    } else {
      await supabase.auth.signOut();
      router.replace("/login");
    }
  };

  const navItems = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Ver todas movimentações", icon: LayoutList, href: "/transactions" },
    { name: "Cadastrar movimentação", icon: PlusCircle, href: "/#new" },
    { name: "Dashboard", icon: PieChart, href: "/dashboard" },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Sidebar Desktop & Mobile */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-300 ease-in-out md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center px-6 border-b border-zinc-200 dark:border-zinc-800">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex bg-zinc-900 dark:bg-zinc-100 p-1.5 rounded-lg">
                <Wallet className="h-5 w-5 text-zinc-100 dark:text-zinc-900" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              FinFlow
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={cn(
                "group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-in-out",
                pathname === item.href
                  ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 hover:text-zinc-900 dark:hover:text-zinc-100"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  pathname === item.href
                    ? "text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100"
                )}
              />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-zinc-500 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 group transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5 group-hover:rotate-12 transition-transform" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
