import { groq } from "@ai-sdk/groq";

export const MODEL_ID = "llama-3.3-70b-versatile";

export function model() {
  return groq(MODEL_ID);
}
