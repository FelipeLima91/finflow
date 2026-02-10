"use client";
import { Github, Linkedin, Heart, Globe } from "lucide-react";

export function Footer() {
  const links = [
    {
      href: "https://github.com/FelipeLima91/finflow",
      icon: Github,
      label: "GitHub",
    },
    {
      href: "https://felipelima91.github.io/portfolio/",
      icon: Globe,
      label: "Portfólio",
    },
    {
      href: "https://www.linkedin.com/in/felipe-lima-de-oliveira/",
      icon: Linkedin,
      label: "LinkedIn",
    },
  ];

  return (
    <footer className="w-full mt-auto py-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
      <div className="mx-auto max-w-6xl px-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        {/* Texto principal */}
        <p className="flex items-center gap-1 text-sm text-zinc-500 dark:text-zinc-400">
          Desenvolvido com{" "}
          <Heart className="h-4 w-4 text-rose-500 fill-rose-500 animate-pulse" />{" "}
          por{" "}
          <a
            href="https://felipelima91.github.io/portfolio/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 transition-colors"
          >
            Felipe Lima
          </a>
        </p>

        {/* Links sociais */}
        <div className="flex items-center gap-4">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
              title={link.label}
            >
              <link.icon className="h-5 w-5" />
              <span className="sr-only">{link.label}</span>
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
