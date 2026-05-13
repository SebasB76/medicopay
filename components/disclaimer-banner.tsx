type Variant = "top" | "bottom";

export function DisclaimerBanner({ variant }: { variant: Variant }) {
  if (variant === "top") {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 text-center sticky top-0 z-10">
        <strong>MediCopay</strong> orienta sobre copagos y hospitales en Ecuador.{" "}
        <span className="font-medium">No es consejo médico.</span> En emergencias llama al{" "}
        <strong>911</strong> o <strong>171</strong>.
      </div>
    );
  }
  return (
    <div className="bg-zinc-50 border-t border-zinc-200 px-4 py-2 text-[11px] text-zinc-500 text-center">
      Las estimaciones de copago son aproximadas. Confirma con tu aseguradora. Datos
      de hospitales con fines demostrativos.
    </div>
  );
}
