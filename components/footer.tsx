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
    <footer className="w-full mt-auto py-6 border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        {/* Texto principal */}
        <p className="flex items-center gap-1 text-sm text-muted-foreground">
          Desenvolvido com{" "}
          <Heart className="h-4 w-4 text-expense fill-expense animate-pulse" />{" "}
          por{" "}
          <a
            href="https://felipelima91.github.io/portfolio/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-foreground hover:text-primary transition-colors"
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
              className="text-muted-foreground hover:text-primary transition-colors"
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
