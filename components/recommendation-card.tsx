import type { RecommendationResult } from "@/lib/types";

export function RecommendationCard({ result }: { result: RecommendationResult }) {
  if (result.kind !== "recommend") {
    return null;
  }

  return (
    <div className="mt-3 border border-zinc-200 rounded-lg overflow-hidden bg-white">
      <div className="px-4 py-3 bg-zinc-50 border-b border-zinc-200">
        <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
          <span>Especialidad recomendada</span>
        </div>
        <div className="text-base font-semibold text-zinc-900 mt-0.5">
          {result.is_emergency && <span aria-hidden>⚠️ </span>}
          {result.specialty}
        </div>
        <div className="text-xs text-zinc-500 mt-1">
          Plan: <strong className="text-zinc-700">{result.plan_name}</strong> · Copago
          base: ${result.base_copay_usd}
        </div>
      </div>

      <ul className="divide-y divide-zinc-100">
        {result.hospitals.map((h) => (
          <li key={h.id} className="px-4 py-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-medium text-zinc-900 text-sm">{h.name}</div>
              <div className="text-xs text-zinc-500 truncate">{h.address}</div>
              <div className="text-xs text-zinc-400 mt-0.5">{h.phone}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-zinc-500">Copago est.</div>
              <div className="text-base font-semibold text-zinc-900">
                ${h.copay_estimate_usd}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
