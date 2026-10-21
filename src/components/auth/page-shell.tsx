import Link from "next/link";
import { ArrowLeft, Workflow } from "lucide-react";

import { UserMenu } from "@/components/auth/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

/** Header + container for the secondary pages (Perfil, Usuários). */
export function PageShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40 px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 shrink-0 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground">
            <Workflow className="w-[18px] h-[18px]" />
          </div>
          <h1 className="text-sm font-semibold text-foreground truncate">{title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" asChild>
            <Link href="/">
              <ArrowLeft className="w-3.5 h-3.5" />
              Voltar ao app
            </Link>
          </Button>
          <ThemeToggle />
          <UserMenu />
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">{children}</main>
    </div>
  );
}
