"use client";

import { Plan } from "@/lib/types";

interface PlanSelectorProps {
  plans: Plan[];
  selectedId: string | null;
  onSelect: (planId: string) => void;
}

export function PlanSelector({ plans, selectedId, onSelect }: PlanSelectorProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-700 mb-3">
        Elige tu plan:
      </p>
      <div className="space-y-2">
        {plans.map((plan) => (
          <button
            key={plan.id}
            onClick={() => onSelect(plan.id)}
            className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
              selectedId === plan.id
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="font-medium text-sm">{plan.name}</div>
                <div
                  className={`text-xs mt-1 ${
                    selectedId === plan.id ? "text-zinc-200" : "text-zinc-500"
                  }`}
                >
                  {plan.summary}
                </div>
              </div>
              {plan.level && (
                <div
                  className={`text-xs px-2 py-1 rounded font-medium shrink-0 ml-2 ${
                    selectedId === plan.id
                      ? "bg-zinc-700 text-zinc-100"
                      : plan.level === "premium"
                      ? "bg-amber-100 text-amber-800"
                      : plan.level === "standard"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {plan.level === "premium"
                    ? "Premium"
                    : plan.level === "standard"
                    ? "Estándar"
                    : "Básico"}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
