export type Plan = {
  id: string;
  name: string;
  level?: "basic" | "standard" | "premium";
  coverage_outpatient_pct: number;
  coverage_hospitalization_pct: number;
  coverage_emergency_pct: number;
  copays: {
    general: number;
    specialist: number;
    emergency: number;
  };
  summary: string;
  // Campos de la aseguradora asociada
  company_id?: string;
  company_name?: string;
  company_type?: "private" | "public" | "cooperative";
  aliases?: string[];
  // Para compatibilidad con código antiguo
  type?: "private" | "public" | "cooperative";
};

export type InsuranceCompany = {
  id: string;
  name: string;
  type: "private" | "public" | "cooperative";
  description: string;
  plans: Plan[];
};

export type Hospital = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  specialties: string[];
  accepted_plans: string[];
  copay_modifier: number;
  tier: "premium" | "standard" | "public";
};

export type Specialty = {
  specialty: string;
  is_emergency: boolean;
  keywords: string[];
};

export type HospitalRecommendation = {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  copay_estimate_usd: number;
  tier: Hospital["tier"];
};

export type RecommendationResult =
  | { kind: "needs"; what: "plan" | "city" }
  | { kind: "unknown_plan"; provided: string }
  | { kind: "no_match"; reason: string }
  | {
      kind: "recommend";
      specialty: string;
      is_emergency: boolean;
      plan_name: string;
      hospitals: HospitalRecommendation[];
      base_copay_usd: number;
    };
