import { describe, it, expect } from "vitest";
import { matchSpecialty, normalizeText } from "@/lib/specialty-match";

describe("normalizeText", () => {
  it("strips accents and lowercases", () => {
    expect(normalizeText("FIEBRE Alta")).toBe("fiebre alta");
    expect(normalizeText("migraña")).toBe("migrana");
    expect(normalizeText("vómito y náuseas")).toBe("vomito y nauseas");
  });

  it("collapses whitespace", () => {
    expect(normalizeText("  tengo   fiebre   ")).toBe("tengo fiebre");
  });
});

describe("matchSpecialty", () => {
  it("matches Medicina General for common symptoms", () => {
    const r = matchSpecialty("Tengo fiebre y tos hace 2 días");
    expect(r.specialty).toBe("Medicina General");
    expect(r.is_emergency).toBe(false);
  });

  it("prioritizes emergency keywords over other specialties", () => {
    const r = matchSpecialty("Tengo dolor de pecho fuerte y palpitaciones");
    expect(r.is_emergency).toBe(true);
    expect(r.specialty).toBe("Emergencias");
  });

  it("ignores accents", () => {
    const r = matchSpecialty("Mi hijo tiene migraña");
    // 'mi hijo' should route to Pediatría before migraña matches Neurología
    expect(r.specialty).toBe("Pediatría");
  });

  it("falls back to Medicina General for unknown symptoms", () => {
    const r = matchSpecialty("xyz blah blah");
    expect(r.specialty).toBe("Medicina General");
    expect(r.matched_keyword).toBeNull();
  });

  it("matches Cardiología for hypertension keywords", () => {
    const r = matchSpecialty("Tengo presión alta hace meses");
    expect(r.specialty).toBe("Cardiología");
    expect(r.is_emergency).toBe(false);
  });
});
