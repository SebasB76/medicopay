import type { RecommendationResult } from "@/lib/types";

function MapPreview({
  name,
  address,
  city,
}: {
  name: string;
  address: string;
  city: string;
}) {
  const query = encodeURIComponent(`${name}, ${address}, ${city}, Ecuador`);
  const embedSrc = `https://www.google.com/maps?q=${query}&z=15&output=embed`;
  const openHref = `https://www.google.com/maps/search/?api=1&query=${query}`;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-cyan-100 bg-white shadow-sm">
      <iframe
        title={`Mapa de ${name}`}
        src={embedSrc}
        loading="lazy"
        className="h-40 w-full border-0"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <a
        href={openHref}
        target="_blank"
        rel="noreferrer"
        className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-900 shadow-sm transition-transform hover:-translate-y-0.5"
      >
        Google Maps
      </a>
      <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
          Ubicación
        </div>
        <div className="truncate text-sm font-medium text-zinc-900">{city}</div>
      </div>
    </div>
  );
}

export function RecommendationCard({ result }: { result: RecommendationResult }) {
  if (result.kind !== "recommend") {
    return null;
  }

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 bg-gradient-to-r from-cyan-50 via-white to-amber-50 px-4 py-4">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-800">
          <span>Especialidad recomendada</span>
        </div>
        <div className="mt-1 text-lg font-semibold tracking-tight text-zinc-900">
          {result.is_emergency && <span aria-hidden>⚠️ </span>}
          {result.specialty}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
          <span className="rounded-full bg-white px-2.5 py-1 font-medium text-zinc-700 shadow-sm ring-1 ring-zinc-200">
            Plan: {result.plan_name}
          </span>
          <span
            className={`rounded-full px-2.5 py-1 font-semibold shadow-sm ring-1 ${
              result.base_copay_usd <= 10
                ? "bg-emerald-50 text-emerald-900 ring-emerald-200"
                : result.base_copay_usd <= 30
                ? "bg-cyan-50 text-cyan-900 ring-cyan-200"
                : "bg-amber-50 text-amber-900 ring-amber-200"
            }`}
          >
            Copago base: ${result.base_copay_usd}
          </span>
        </div>
      </div>

      <ul className="divide-y divide-zinc-100">
        {result.hospitals.map((h) => (
          <li key={h.id} className="px-4 py-4 sm:px-5">
            <div className="grid gap-4 sm:grid-cols-[1fr_140px] sm:items-start">
              <div className="min-w-0 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-zinc-900 sm:text-base">{h.name}</div>
                    <div className="mt-0.5 text-xs font-medium uppercase tracking-[0.14em] text-cyan-800">
                      {h.city}
                    </div>
                  </div>
                  <div className="inline-flex rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-700 sm:hidden">
                    {h.tier}
                  </div>
                </div>
                <div className="text-xs text-zinc-500">{h.address}</div>
                <div className="text-xs text-zinc-400">{h.phone}</div>
                <div className="pt-1">
                  <MapPreview name={h.name} address={h.address} city={h.city} />
                </div>
              </div>

              <div className="flex items-start justify-between gap-3 sm:flex-col sm:items-end sm:text-right">
                <div className="sm:order-2">
                  <div className="text-xs font-medium text-zinc-500">Copago est.</div>
                  <div
                    className={`text-2xl font-semibold tracking-tight ${
                      h.copay_estimate_usd <= 10
                        ? "text-emerald-700"
                        : h.copay_estimate_usd <= 30
                        ? "text-cyan-900"
                        : "text-amber-800"
                    }`}
                  >
                    ${h.copay_estimate_usd}
                  </div>
                </div>
                <div className="hidden rounded-full bg-zinc-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-700 sm:inline-flex sm:order-1">
                  {h.tier}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="border-t border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-600">
        <div className="flex items-start gap-2">
          <span className="text-2xl">⚠️</span>
          <div>
            Esto no es consejo médico. Las estimaciones de copago son aproximadas; confirma con tu aseguradora.
          </div>
        </div>
      </div>
    </div>
  );
}
