"use client";

import { InsuranceCompany } from "@/lib/types";

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
    <div className="space-y-2">
      <p className="text-sm font-medium text-zinc-700 mb-3">
        Elige tu aseguradora:
      </p>
      <div className="grid grid-cols-2 gap-2">
        {companies.map((company) => (
          <button
            key={company.id}
            onClick={() => onSelect(company.id)}
            className={`p-3 rounded-lg border-2 text-left transition-colors ${
              selectedId === company.id
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-200 bg-white text-zinc-900 hover:border-zinc-400"
            }`}
          >
            <div className="font-medium text-sm">{company.name}</div>
            <div
              className={`text-xs ${
                selectedId === company.id ? "text-zinc-200" : "text-zinc-500"
              }`}
            >
              {company.type === "private"
                ? "Privada"
                : company.type === "cooperative"
                ? "Cooperativa"
                : "Pública"}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
