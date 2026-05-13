import specialtiesData from "@/data/specialties.json";
import type { Specialty } from "./types";

const SPECIALTIES = specialtiesData as Specialty[];

export function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchSpecialty(rawSymptoms: string): {
  specialty: string;
  is_emergency: boolean;
  matched_keyword: string | null;
} {
  const text = normalizeText(rawSymptoms);

  // 1) Emergency keywords win first.
  for (const s of SPECIALTIES) {
    if (!s.is_emergency) continue;
    for (const kw of s.keywords) {
      if (text.includes(normalizeText(kw))) {
        return {
          specialty: s.specialty,
          is_emergency: true,
          matched_keyword: kw,
        };
      }
    }
  }

  // 2) Non-emergency: first match wins. Order in specialties.json matters
  //    (more specific specialties listed before Medicina General fallback).
  for (const s of SPECIALTIES) {
    if (s.is_emergency) continue;
    for (const kw of s.keywords) {
      if (text.includes(normalizeText(kw))) {
        return {
          specialty: s.specialty,
          is_emergency: false,
          matched_keyword: kw,
        };
      }
    }
  }

  // 3) No match: default to general medicine.
  return {
    specialty: "Medicina General",
    is_emergency: false,
    matched_keyword: null,
  };
}
