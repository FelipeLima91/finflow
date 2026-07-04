'use client';

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 transition-all duration-300 ease-in-out md:pl-64">
        {children}
      </main>
    </div>
  );
}
