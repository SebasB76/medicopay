"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "@/components/chat-message";
import { DisclaimerBanner } from "@/components/disclaimer-banner";
import { InsuranceSelector } from "@/components/insurance-selector";
import { PlanSelector } from "@/components/plan-selector";
import { SymptomsInput } from "@/components/symptoms-input";
import companiesData from "@/data/insurance-companies.json";
import { InsuranceCompany, Plan } from "@/lib/types";

const WELCOME_TEXT = `¡Hola! Soy MediCopay 🩺

Te ayudaré a encontrar la mejor recomendación hospitalaria según tus síntomas, aseguradora y ubicación.`;

export default function Home() {
  const [selectedInsurance, setSelectedInsurance] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState("");
  const [city, setCity] = useState("");

  const { messages, append, isLoading, error, reload, stop } = useChat({
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
  const fallbackTimer = useRef<number | null>(null);
  const messagesRef = useRef<any[]>(messages);
  const lastUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Cancel fallback timer if AI assistant responded after the last user message
  useEffect(() => {
    if (!fallbackTimer.current) return;
    const msgs = messagesRef.current || [];
    const uid = lastUserIdRef.current;
    if (!uid) return;
    const idx = msgs.findIndex((m) => m.id === uid);
    if (idx >= 0) {
      const laterAssistant = msgs.slice(idx + 1).some((m) => m.role === "assistant");
      if (laterAssistant) {
        clearTimeout(fallbackTimer.current as number);
        fallbackTimer.current = null;
      }
    }
  }, [messages]);

  // Get selected company's plans
  const selectedCompany = (companiesData as InsuranceCompany[]).find(
    (c) => c.id === selectedInsurance
  );
  const plansForCompany = selectedCompany?.plans || [];

  // Get selected plan object
  const selectedPlanObject = plansForCompany.find((p: Plan) => p.id === selectedPlan);

  // Handler to submit the form
  const handleRecommendationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedPlan || !symptoms.trim() || !city) {
      return;
    }

    // Create a formatted message for the API
    const userMessage = `Síntomas: ${symptoms.trim()}. Aseguradora: ${selectedCompany?.name}. Plan: ${selectedPlanObject?.name}. Ciudad: ${city}.`;

    // Use the append function from useChat to add the message and mark it with an id
    const uid = `user-${Date.now()}`;
    lastUserIdRef.current = uid;
    append({ id: uid, role: "user", content: userMessage });

    // start fallback timer: if no assistant message appears within 3s, call /api/recommend
    if (fallbackTimer.current) {
      clearTimeout(fallbackTimer.current);
    }
    // @ts-ignore window.setTimeout returns number
    fallbackTimer.current = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMessage }),
        });
        if (res.ok) {
          const json = await res.json();
          if (json?.reply) {
            // verify no assistant message already appeared after our uid
            const msgs = messagesRef.current || [];
            const lastIndex = msgs.findIndex((m) => m.id === uid);
            const laterAssistant = lastIndex >= 0 && msgs.slice(lastIndex + 1).some((m) => m.role === "assistant");
            if (!laterAssistant) {
              append({ role: "assistant", content: json.reply });
            }
          }
        }
      } catch (err) {
        console.warn("recommend fetch failed", err);
      }
    }, 3000);

    // Reset form after submission
    setSymptoms("");
    setCity("");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

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

      <div className="border-t border-zinc-200 bg-white px-4 py-4">
        <div className="max-w-2xl mx-auto">
          {!selectedInsurance ? (
            <InsuranceSelector
              companies={companiesData as InsuranceCompany[]}
              selectedId={selectedInsurance}
              onSelect={setSelectedInsurance}
            />
          ) : !selectedPlan ? (
            <div className="space-y-3">
              <button
                onClick={() => {
                  setSelectedInsurance(null);
                  setSelectedPlan(null);
                }}
                className="text-xs text-zinc-500 hover:text-zinc-700 underline mb-2"
              >
                ← Cambiar aseguradora
              </button>
              <PlanSelector
                plans={plansForCompany}
                selectedId={selectedPlan}
                onSelect={setSelectedPlan}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-xs text-zinc-500 hover:text-zinc-700 underline"
              >
                ← Cambiar plan
              </button>
              <div className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                <p className="text-sm text-zinc-700">
                  <span className="font-medium">Aseguradora:</span> {selectedCompany?.name}
                  <br />
                  <span className="font-medium">Plan:</span> {selectedPlanObject?.name}
                </p>
              </div>
              <SymptomsInput
                symptoms={symptoms}
                city={city}
                onSymptomsChange={setSymptoms}
                onCityChange={setCity}
                isLoading={isLoading}
                onSubmit={handleRecommendationSubmit}
              />
            </div>
          )}
        </div>
      </div>

      <DisclaimerBanner variant="bottom" />
    </div>
  );
}
