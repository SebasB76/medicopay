"use client";

import { InsuranceCompany } from "@/lib/types";

const COMPANY_STYLES: Record<
  string,
  { accent: string; tint: string; ring: string; badge: string; initials: string }
> = {
  sanitas: {
    accent: "from-cyan-700 via-teal-600 to-emerald-600",
    tint: "bg-cyan-50",
    ring: "ring-cyan-200",
    badge: "text-cyan-900",
    initials: "S",
  },
  "salud-sa": {
    accent: "from-emerald-700 via-teal-600 to-cyan-600",
    tint: "bg-emerald-50",
    ring: "ring-emerald-200",
    badge: "text-emerald-900",
    initials: "SS",
  },
  confiamed: {
    accent: "from-indigo-700 via-sky-600 to-cyan-600",
    tint: "bg-indigo-50",
    ring: "ring-indigo-200",
    badge: "text-indigo-900",
    initials: "C",
  },
  iess: {
    accent: "from-slate-800 via-slate-700 to-sky-700",
    tint: "bg-slate-50",
    ring: "ring-slate-200",
    badge: "text-slate-900",
    initials: "I",
  },
  axa: {
    accent: "from-sky-700 via-blue-600 to-cyan-600",
    tint: "bg-sky-50",
    ring: "ring-sky-200",
    badge: "text-sky-900",
    initials: "AXA",
  },
  "seguros-bolivar": {
    accent: "from-amber-700 via-orange-600 to-rose-600",
    tint: "bg-amber-50",
    ring: "ring-amber-200",
    badge: "text-amber-900",
    initials: "B",
  },
  integra: {
    accent: "from-violet-700 via-fuchsia-600 to-rose-600",
    tint: "bg-violet-50",
    ring: "ring-violet-200",
    badge: "text-violet-900",
    initials: "IN",
  },
};

interface InsuranceSelectorProps {
  companies: InsuranceCompany[];
  selectedId: string | null;
  onSelect: (companyId: string) => void;
}

export function InsuranceSelector({
  companies,
  selectedId,
  onSelect,
}: InsuranceSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-700">
        Elige tu aseguradora:
      </p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          (() => {
            const style = COMPANY_STYLES[company.id] ?? {
              accent: "from-zinc-700 via-zinc-600 to-zinc-500",
              tint: "bg-zinc-50",
              ring: "ring-zinc-200",
              badge: "text-zinc-900",
              initials: company.name
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase(),
            };

            return (
          <button
            key={company.id}
            onClick={() => onSelect(company.id)}
            className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition-all duration-200 ${
              selectedId === company.id
                ? `border-transparent bg-white shadow-lg ring-2 ${style.ring} -translate-y-0.5`
                : "border-zinc-200 bg-white text-zinc-900 hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
            }`}
          >
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${style.accent} opacity-0 transition-opacity group-hover:opacity-100 ${
                selectedId === company.id ? "opacity-100" : ""
              }`}
            />
            <div className="flex items-start gap-3">
              <div
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/80 bg-gradient-to-br ${style.accent} text-sm font-semibold text-white shadow-sm`}
                aria-hidden
              >
                <span className="translate-y-[0.5px] tracking-tight">{style.initials}</span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-zinc-900">{company.name}</div>
                    <div className="mt-0.5 text-xs text-zinc-500">
                      {company.type === "private"
                        ? "Privada"
                        : company.type === "cooperative"
                        ? "Cooperativa"
                        : "Pública"}
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${style.tint} ${style.badge}`}
                  >
                    {company.plans.length} planes
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                  {company.description}
                </p>
              </div>
            </div>
            {selectedId === company.id && (
              <div className="mt-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-700">
                <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${style.accent}`} />
                Seleccionada
              </div>
            )}
          </button>
            );
          })()
        ))}
      </div>
    </div>
  );
}
