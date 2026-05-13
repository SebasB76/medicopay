"use client";

interface SymptomsInputProps {
  symptoms: string;
  city: string;
  onSymptomsChange: (symptoms: string) => void;
  onCityChange: (city: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function SymptomsInput({
  symptoms,
  city,
  onSymptomsChange,
  onCityChange,
  isLoading,
  onSubmit,
}: SymptomsInputProps) {
  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && symptoms.trim() && city) {
      e.preventDefault();
      onSubmit(e as any);
    }
  }

  const canSubmit = symptoms.trim() && city;

  return (
    <form onSubmit={onSubmit} className="space-y-3 mt-4">
      <div>
        <label htmlFor="city" className="text-sm font-medium text-zinc-700">
          Tu ciudad:
        </label>
        <select
          id="city"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={isLoading}
          className="w-full mt-2 px-3 py-2 rounded-lg border border-zinc-300 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent disabled:bg-zinc-100"
        >
          <option value="">Selecciona una ciudad</option>
          <option value="Quito">Quito</option>
          <option value="Guayaquil">Guayaquil</option>
          <option value="Cuenca">Cuenca</option>
        </select>
      </div>

      <div>
        <label htmlFor="symptoms" className="text-sm font-medium text-zinc-700">
          Tus síntomas:
        </label>
        <textarea
          id="symptoms"
          value={symptoms}
          onChange={(e) => onSymptomsChange(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Describe lo que te pasa…"
          rows={3}
          disabled={isLoading}
          className="w-full mt-2 resize-none rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent disabled:bg-zinc-100"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit || isLoading}
        className="w-full rounded-lg bg-zinc-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-700 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "Procesando…" : "Obtener Recomendación"}
      </button>
    </form>
  );
}
