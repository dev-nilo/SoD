"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type AppSection = "validador" | "sod" | "comparador";

interface SectionNavItem {
  id: AppSection;
  label: string;
  icon: LucideIcon;
}

interface SectionNavProps {
  active: AppSection;
  onChange: (section: AppSection) => void;
  items: SectionNavItem[];
}

export function SectionNav({ active, onChange, items }: SectionNavProps) {
  return (
    <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-background text-foreground border border-border shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
