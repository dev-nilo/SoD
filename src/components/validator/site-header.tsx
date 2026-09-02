"use client";

import { Database, Workflow } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  SectionNav,
  type AppSection,
} from "@/components/validator/section-nav";

interface SiteHeaderProps {
  section: AppSection;
  onSectionChange: (section: AppSection) => void;
  sectionItems: { id: AppSection; label: string; icon: typeof Workflow }[];
  varCatalogCount: number;
  onOpenCatalog: () => void;
}

export function SiteHeader({
  section,
  onSectionChange,
  sectionItems,
  varCatalogCount,
  onOpenCatalog,
}: SiteHeaderProps) {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 shrink-0 rounded-lg bg-muted border border-border flex items-center justify-center text-foreground">
          <Workflow className="w-[18px] h-[18px]" />
        </div>
        <div>
          <h1 className="text-sm font-semibold text-foreground">
            Barril Valida
          </h1>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <SectionNav
          active={section}
          onChange={onSectionChange}
          items={sectionItems}
        />

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        <Button variant="secondary" onClick={onOpenCatalog}>
          <Database className="w-3.5 h-3.5" />
          Dicionário do VAR ({varCatalogCount})
        </Button>

        <Separator orientation="vertical" className="h-6 hidden sm:block" />

        <ThemeToggle />
      </div>
    </header>
  );
}
