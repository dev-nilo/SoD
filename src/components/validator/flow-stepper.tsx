"use client";

import { Check, type LucideIcon } from "lucide-react";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type FlowStepState = "pending" | "current" | "complete";

export interface FlowStep {
  id: string;
  label: string;
  icon: LucideIcon;
  state: FlowStepState;
  badge?: number;
}

export function FlowStepper({ steps }: { steps: FlowStep[] }) {
  return (
    <div className="relative">
      <div className="absolute left-0 right-0 top-4 h-px bg-border" aria-hidden />

      <TabsList
        className="relative z-10 grid h-auto w-full border-none bg-transparent p-0"
        style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}
      >
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <TabsTrigger
              key={step.id}
              value={step.id}
              className="flex flex-col items-center justify-start gap-1.5 whitespace-normal rounded-lg border-none bg-transparent px-1 py-1.5 text-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[state=active]:border-transparent data-[state=active]:bg-transparent"
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-background transition-colors",
                  step.state === "pending" && "border-border text-muted-foreground",
                  step.state === "current" && "border-primary bg-primary text-primary-foreground",
                  step.state === "complete" && "border-success bg-success/10 text-success"
                )}
              >
                {step.state === "complete" ? <Check className="h-4 w-4" /> : <Icon className="h-3.5 w-3.5" />}
              </span>

              <span
                className={cn(
                  "flex flex-col items-center gap-0.5 text-[11px] font-semibold leading-tight sm:flex-row sm:gap-1.5 sm:text-xs sm:leading-none",
                  step.state === "pending" && "text-muted-foreground",
                  step.state === "current" && "text-primary",
                  step.state === "complete" && "text-foreground"
                )}
              >
                <span>{step.label}</span>
                {typeof step.badge === "number" && step.badge > 0 && (
                  <span className="inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary px-1 text-[10px] font-bold text-secondary-foreground">
                    {step.badge}
                  </span>
                )}
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
}
