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
          className="bg-card border-border shadow-sm"
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
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 ease-in-out md:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex bg-primary p-1.5 rounded-lg">
                <Wallet className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-sidebar-foreground">
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
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  pathname === item.href
                    ? "text-primary"
                    : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                )}
              />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:bg-expense-muted hover:text-expense group transition-all duration-200"
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
