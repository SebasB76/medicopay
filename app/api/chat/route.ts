import { streamText, tool } from "ai";
import { z } from "zod";
import { model } from "@/lib/groq";
import { SYSTEM_PROMPT } from "@/lib/prompts";
import { recommend } from "@/lib/retrieval";

export const runtime = "edge";
export const maxDuration = 30;

const recommendTool = tool({
  description:
    "Recomienda hospitales y estima el copago. Llamar SOLO cuando tengas los tres datos: síntomas, seguro médico, ciudad.",
  parameters: z.object({
    symptoms: z
      .string()
      .min(1)
      .describe("Síntomas o motivo de consulta del paciente, en español."),
    plan_id: z
      .string()
      .optional()
      .describe(
        "Nombre del seguro médico del paciente. Ejemplos: 'Sanitas Plus', 'Salud S.A. Premier', 'Confiamed Familiar', 'IESS'."
      ),
    city: z
      .string()
      .optional()
      .describe("Ciudad del paciente. Debe ser 'Quito' o 'Guayaquil'."),
  }),
  execute: async ({ symptoms, plan_id, city }) => {
    return recommend(symptoms, plan_id, city);
  },
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages)) {
      return new Response(
        JSON.stringify({
          error: "Formato inválido. Se esperaba { messages: [...] }.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!process.env.GROQ_API_KEY) {
      return new Response(
        JSON.stringify({
          error:
            "El servicio no está configurado. Falta GROQ_API_KEY en el servidor.",
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const result = streamText({
      model: model(),
      system: SYSTEM_PROMPT,
      messages,
      tools: { recommend_hospitals: recommendTool },
      maxRetries: 3,
      temperature: 0.3,
      maxTokens: 700,
    });

    return result.toDataStreamResponse();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Error desconocido";
    return new Response(
      JSON.stringify({
        error: "Hubo un problema procesando tu mensaje. Intenta de nuevo en unos segundos.",
        details: msg,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
