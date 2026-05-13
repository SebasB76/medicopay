#!/usr/bin/env node
// Smoke test: verifica que Groq + tool calling funciona antes de confiar
// en la ruta /api/chat. Corre con: `pnpm smoke:groq` (lee .env.local).

import { groq } from "@ai-sdk/groq";
import { generateText, tool } from "ai";
import { z } from "zod";

if (!process.env.GROQ_API_KEY) {
  console.error("❌ Falta GROQ_API_KEY. Crea .env.local con tu key.");
  console.error("   Obtén una gratis en https://console.groq.com/keys");
  process.exit(1);
}

console.log("→ Llamando a Groq (llama-3.3-70b-versatile) con una herramienta…");

const startedAt = Date.now();

try {
  const result = await generateText({
    model: groq("llama-3.3-70b-versatile"),
    messages: [
      {
        role: "user",
        content:
          "Por favor llama a la herramienta `ping` pasándole exactamente el texto 'hola'.",
      },
    ],
    tools: {
      ping: tool({
        description: "Devuelve el texto recibido para verificar que el tool calling funciona.",
        parameters: z.object({
          text: z.string().describe("Texto a devolver tal cual."),
        }),
        execute: async ({ text }) => ({ echo: text }),
      }),
    },
    maxRetries: 2,
    temperature: 0.1,
  });

  const ms = Date.now() - startedAt;
  console.log(`→ Respuesta en ${ms}ms.`);
  console.log(`  text: ${JSON.stringify(result.text)}`);
  console.log(`  toolCalls: ${result.toolCalls.length}`);
  console.log(`  toolResults: ${result.toolResults.length}`);

  if (result.toolCalls.length === 0) {
    console.error(
      "❌ FAIL: el modelo no invocó la herramienta. El tool calling de Groq " +
        "puede estar roto en esta versión del SDK; revisa el fallback (JSON mode)."
    );
    process.exit(2);
  }

  console.log("✅ OK: Groq + tool calling funcionan. Puedes confiar en /api/chat.");
} catch (err) {
  console.error("❌ Error llamando a Groq:");
  console.error(err);
  process.exit(3);
}
