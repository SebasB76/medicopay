import { describe, it, expect } from "vitest";
import { recommend, findPlan } from "@/lib/retrieval";

describe("findPlan", () => {
  it("matches by canonical name", () => {
    const p = findPlan("Sanitas Plus");
    expect(p?.id).toBe("sanitas-plus");
  });

  it("matches by alias", () => {
    expect(findPlan("sanitas")?.id).toBe("sanitas-plus");
    expect(findPlan("IESS")?.id).toBe("iess");
    expect(findPlan("Confiamed Familiar")?.id).toBe("confiamed-familiar");
  });

  it("returns undefined for unknown plans", () => {
    expect(findPlan("Aetna Gold")).toBeUndefined();
  });
});

describe("recommend", () => {
  it("returns needs:plan when no plan provided", () => {
    const r = recommend("Tengo fiebre", undefined, "Quito");
    expect(r.kind).toBe("needs");
    if (r.kind === "needs") expect(r.what).toBe("plan");
  });

  it("returns needs:city when no city provided", () => {
    const r = recommend("Tengo fiebre", "Sanitas Plus", undefined);
    expect(r.kind).toBe("needs");
    if (r.kind === "needs") expect(r.what).toBe("city");
  });

  it("returns unknown_plan for unrecognized plans", () => {
    const r = recommend("Tengo fiebre", "Aetna Gold", "Quito");
    expect(r.kind).toBe("unknown_plan");
  });

  it("recommends hospitals for valid input", () => {
    const r = recommend(
      "Tengo fiebre y dolor de garganta",
      "Sanitas Plus",
      "Quito"
    );
    expect(r.kind).toBe("recommend");
    if (r.kind === "recommend") {
      expect(r.specialty).toBe("Medicina General");
      expect(r.plan_name).toBe("Sanitas Plus");
      expect(r.hospitals.length).toBeGreaterThan(0);
      expect(r.hospitals.length).toBeLessThanOrEqual(3);
      for (const h of r.hospitals) {
        expect(h.city).toBe("Quito");
        expect(h.copay_estimate_usd).toBeGreaterThan(0);
      }
    }
  });

  it("routes emergencies to Emergencias", () => {
    const r = recommend(
      "Dolor de pecho intenso, no puedo respirar bien",
      "Sanitas Plus",
      "Quito"
    );
    expect(r.kind).toBe("recommend");
    if (r.kind === "recommend") {
      expect(r.is_emergency).toBe(true);
      expect(r.specialty).toBe("Emergencias");
    }
  });

  it("returns IESS hospitals for IESS plan", () => {
    const r = recommend("Tengo fiebre", "IESS", "Quito");
    expect(r.kind).toBe("recommend");
    if (r.kind === "recommend") {
      expect(r.plan_name).toBe("IESS");
      expect(r.base_copay_usd).toBe(0);
      for (const h of r.hospitals) {
        expect(h.name).toContain("IESS");
      }
    }
  });
});
