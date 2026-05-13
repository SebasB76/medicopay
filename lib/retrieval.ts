import plansData from "@/data/plans.json";
import hospitalsData from "@/data/hospitals.json";
import type {
  Plan,
  Hospital,
  HospitalRecommendation,
  RecommendationResult,
} from "./types";
import { normalizeText, matchSpecialty } from "./specialty-match";

const PLANS = plansData as Plan[];
const HOSPITALS = hospitalsData as Hospital[];

export function findPlan(input: string | undefined): Plan | undefined {
  if (!input) return undefined;
  const normalized = normalizeText(input);
  
  // 1. Exacta por ID
  let result = PLANS.find((p) => normalizeText(p.id) === normalized);
  if (result) return result;
  
  // 2. Exacta por nombre
  result = PLANS.find((p) => normalizeText(p.name) === normalized);
  if (result) return result;
  
  // 3. Exacta por alias
  result = PLANS.find((p) => 
    (p.aliases || []).some((a) => normalizeText(a) === normalized)
  );
  if (result) return result;
  
  // 4. Búsqueda parcial (incluye)
  result = PLANS.find((p) => 
    normalized.includes(normalizeText(p.id)) ||
    normalized.includes(normalizeText(p.name)) ||
    (p.aliases || []).some((a) => normalized.includes(normalizeText(a)))
  );
  if (result) return result;
  
  // 5. Último recurso: cualquier plan que tenga palabras clave
  return PLANS.find((p) => 
    normalizeText(p.id).includes(normalized) ||
    normalizeText(p.name).includes(normalized)
  );
}

function pickBaseCopay(plan: Plan, specialty: string, isEmergency: boolean): number {
  if (isEmergency) return plan.copays.emergency;
  if (specialty === "Medicina General" || specialty === "Pediatría") {
    return plan.copays.general;
  }
  return plan.copays.specialist;
}

function normalizeCity(input: string | undefined): string | undefined {
  if (!input) return undefined;
  const c = normalizeText(input);
  if (c.includes("quito")) return "Quito";
  if (c.includes("guayaquil")) return "Guayaquil";
  if (c.includes("cuenca")) return "Cuenca";
  return undefined;
}

export function recommend(
  symptoms: string,
  rawPlan: string | undefined,
  rawCity: string | undefined
): RecommendationResult {
  if (!rawPlan || !rawPlan.trim()) {
    return { kind: "needs", what: "plan" };
  }

  const plan = findPlan(rawPlan);
  if (!plan) {
    return { kind: "unknown_plan", provided: rawPlan };
  }

  if (!rawCity || !rawCity.trim()) {
    return { kind: "needs", what: "city" };
  }
  const city = normalizeCity(rawCity);
  if (!city) {
    return { kind: "needs", what: "city" };
  }

  const { specialty, is_emergency } = matchSpecialty(symptoms);
  const base_copay = pickBaseCopay(plan, specialty, is_emergency);

  // Filter hospitals: city + accepts plan + has specialty (or Emergencias if emergency).
  const requiredSpecialty = is_emergency ? "Emergencias" : specialty;

  const matches = HOSPITALS.filter(
    (h) =>
      h.city === city &&
      h.accepted_plans.includes(plan.id) &&
      h.specialties.includes(requiredSpecialty)
  );

  if (matches.length === 0) {
    return {
      kind: "no_match",
      reason: `No encontramos hospitales en ${city} de tu plan ${plan.name} con ${requiredSpecialty}. Considera ampliar tu búsqueda u otra red.`,
    };
  }

  // Sort: lowest copay_modifier first (cheapest), then alphabetically.
  const sorted = matches
    .slice()
    .sort((a, b) => a.copay_modifier - b.copay_modifier || a.name.localeCompare(b.name));

  const top: HospitalRecommendation[] = sorted.slice(0, 3).map((h) => ({
    id: h.id,
    name: h.name,
    city: h.city,
    address: h.address,
    phone: h.phone,
    copay_estimate_usd: Math.round(base_copay * h.copay_modifier),
    tier: h.tier,
  }));

  return {
    kind: "recommend",
    specialty: requiredSpecialty,
    is_emergency,
    plan_name: plan.name,
    hospitals: top,
    base_copay_usd: base_copay,
  };
}
