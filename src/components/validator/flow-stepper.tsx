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
    <TabsList className="flex h-auto w-full items-stretch border-none bg-transparent p-0 gap-0">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex flex-1 items-center last:flex-none">
            <TabsTrigger
              value={step.id}
              className="flex shrink-0 items-center gap-2.5 whitespace-normal rounded-lg border-none bg-transparent px-2 py-1.5 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring data-[state=active]:border-transparent data-[state=active]:bg-transparent"
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors",
                  step.state === "pending" && "border-border bg-background text-muted-foreground",
                  step.state === "current" && "border-primary bg-primary text-primary-foreground",
                  step.state === "complete" && "border-success bg-success text-success-foreground"
                )}
              >
                {step.state === "complete" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </span>

              <span className="flex flex-col items-start leading-tight">
                <span
                  className={cn(
                    "text-xs font-semibold",
                    step.state === "pending" && "text-muted-foreground",
                    step.state === "current" && "text-foreground",
                    step.state === "complete" && "text-foreground"
                  )}
                >
                  {step.label}
                </span>
                {typeof step.badge === "number" && step.badge > 0 && (
                  <span className="text-[11px] text-muted-foreground">{step.badge} itens</span>
                )}
              </span>
            </TabsTrigger>

            {!isLast && (
              <div
                className={cn(
                  "mx-2 h-px flex-1 min-w-6 transition-colors",
                  step.state === "complete" ? "bg-success" : "bg-border"
                )}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </TabsList>
  );
}
