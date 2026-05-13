"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import { ChatMessage } from "@/components/chat-message";
import { DisclaimerBanner } from "@/components/disclaimer-banner";

const WELCOME_TEXT = `¡Hola! Soy MediCopay 🩺

Cuéntame qué te pasa y te recomiendo qué especialista ver, en qué hospital, y con qué copago aproximado.

Para responderte necesito tres cosas:
1. Tus síntomas
2. Tu seguro médico (Sanitas Plus, Salud S.A. Premier, Confiamed Familiar o IESS)
3. Tu ciudad (Quito o Guayaquil)

Por ejemplo: "Tengo fiebre y dolor de garganta hace 2 días, estoy en Quito, mi seguro es Sanitas Plus".`;

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload, stop } =
    useChat({
      api: "/api/chat",
      initialMessages: [
        {
          id: "welcome",
          role: "assistant",
          content: WELCOME_TEXT,
        },
      ],
    });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSubmit();
      }
    }
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <DisclaimerBanner variant="top" />

      <header className="px-4 py-3 border-b border-zinc-200 bg-white">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden>
              🩺
            </span>
            <div>
              <h1 className="font-semibold text-zinc-900 text-base leading-tight">
                MediCopay
              </h1>
              <p className="text-[11px] text-zinc-500 leading-tight">
                Copagos y hospitales en Ecuador
              </p>
            </div>
          </div>
          <span className="text-[10px] uppercase tracking-wide text-zinc-400">
            Beta
          </span>
        </div>
      </header>

      <main
        ref={scrollRef}
        className="flex-1 overflow-y-auto bg-zinc-50/40"
        aria-live="polite"
      >
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-3 pb-6">
          {messages.map((m) => (
            <ChatMessage key={m.id} message={m} />
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-zinc-100 text-zinc-500 rounded-2xl px-4 py-2.5 text-sm">
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 bg-zinc-400 rounded-full animate-bounce" />
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl px-4 py-3 text-sm max-w-[90%]">
                Hubo un problema. Intenta de nuevo en unos segundos.
                <button
                  onClick={() => reload()}
                  className="ml-2 underline font-medium hover:no-underline"
                >
                  Reintentar
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      <form
        onSubmit={handleSubmit}
        className="border-t border-zinc-200 bg-white px-4 py-3"
      >
        <div className="max-w-2xl mx-auto flex gap-2 items-end">
          <textarea
            value={input}
            onChange={handleInputChange}
            onKeyDown={onKeyDown}
            placeholder="Cuéntame qué te pasa…"
            rows={1}
            className="flex-1 resize-none rounded-2xl border border-zinc-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent min-h-[42px] max-h-32"
            disabled={isLoading}
          />
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="rounded-2xl bg-zinc-200 text-zinc-700 px-4 py-2.5 text-sm font-medium hover:bg-zinc-300 transition-colors shrink-0"
            >
              Detener
            </button>
          ) : (
            <button
              type="submit"
              disabled={!input.trim()}
              className="rounded-2xl bg-zinc-900 text-white px-4 py-2.5 text-sm font-medium hover:bg-zinc-700 disabled:bg-zinc-300 disabled:cursor-not-allowed transition-colors shrink-0"
            >
              Enviar
            </button>
          )}
        </div>
      </form>

      <DisclaimerBanner variant="bottom" />
    </div>
  );
}
