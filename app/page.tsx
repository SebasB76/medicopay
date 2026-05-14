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
  const [messageCounter, setMessageCounter] = useState(0);

  const { messages, append, isLoading, error, reload } = useChat({
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

  const selectedCompany = (companiesData as InsuranceCompany[]).find(
    (c) => c.id === selectedInsurance
  );
  const plansForCompany = selectedCompany?.plans || [];
  const selectedPlanObject = plansForCompany.find((p: Plan) => p.id === selectedPlan);

  const handleRecommendationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!selectedPlan || !symptoms.trim() || !city) {
      return;
    }

    const userMessage = `Síntomas: ${symptoms.trim()}. Aseguradora: ${selectedCompany?.name}. Plan: ${selectedPlanObject?.name}. Ciudad: ${city}.`;

    const uid = `user-${messageCounter}`;
    setMessageCounter(messageCounter + 1);
    lastUserIdRef.current = uid;
    append({ id: uid, role: "user", content: userMessage });

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

    setSymptoms("");
    setCity("");
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div className="flex min-h-screen flex-col bg-[#f7f5f0] text-zinc-900">
      <DisclaimerBanner variant="top" />

      <header className="border-b border-teal-900/25 bg-gradient-to-r from-teal-800 via-cyan-800 to-slate-800 px-4 py-4 text-white shadow-[0_8px_30px_rgba(15,23,42,0.18)] backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/12 shadow-sm">
              <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden="true">
                <defs>
                  <linearGradient id="medicopay-mark" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#155e75" />
                    <stop offset="55%" stopColor="#0f766e" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
                <rect x="4" y="4" width="32" height="32" rx="10" fill="#f0fdfa" />
                <rect x="6.5" y="6.5" width="27" height="27" rx="8.5" fill="none" stroke="url(#medicopay-mark)" strokeWidth="1.4" />
                <circle cx="14" cy="15" r="4" fill="url(#medicopay-mark)" opacity="0.18" />
                <circle cx="27" cy="14" r="4" fill="url(#medicopay-mark)" opacity="0.12" />
                <path
                  d="M11 23.5h4.1l1.4-3.5 2.1 7 2.2-5.2 1.1 1.7H29"
                  fill="none"
                  stroke="url(#medicopay-mark)"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 10.5v6m-3-3h6"
                  fill="none"
                  stroke="#0f766e"
                  strokeWidth="2.1"
                  strokeLinecap="round"
                />
                <circle cx="31" cy="29" r="1.8" fill="#f59e0b" />
                <circle cx="10" cy="29" r="1.4" fill="#22c55e" opacity="0.9" />
              </svg>
            </div>
            <div>
              <h1 className="text-base font-semibold tracking-tight text-white sm:text-lg">
                MediCopay
              </h1>
              <p className="text-xs text-slate-300">Copagos y hospitales en Ecuador</p>
            </div>
          </div>
          <span className="rounded-full border border-white/10 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-sm">
            Beta
          </span>
        </div>
      </header>

      <main ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5" aria-live="polite">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white shadow-sm">
            <div className="border-b border-zinc-200 px-5 py-4 sm:px-6">
              <p className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-900">
                <span className="h-2 w-2 rounded-full bg-cyan-500" />
                Asistente conversacional de salud
              </p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight text-zinc-900 sm:text-2xl">
                Escribe lo que te pasa y te ayudo a orientarte.
              </h2>
              <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                Atiende tu consulta con una guía sencilla para elegir tu cobertura y continuar el proceso.
              </p>
            </div>

            <div className="space-y-3 px-5 py-4 sm:px-6">
              <div className="space-y-3 rounded-2xl bg-zinc-50/80 p-4">
                {messages.map((m) => (
                  <ChatMessage key={m.id} message={m} />
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-700 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 text-white shadow-sm">
                          <span className="relative flex h-3.5 w-3.5">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60 opacity-75" />
                            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-white" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-zinc-900">MediCopay está preparando tu respuesta</p>
                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-200">
                            <div className="h-full w-1/2 rounded-full bg-zinc-900 animate-shimmer-slide" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex justify-start">
                    <div className="max-w-[90%] rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 shadow-sm">
                      <div className="font-medium">Hubo un problema al responder.</div>
                      <div className="mt-1 text-rose-800/90">Intenta de nuevo en unos segundos.</div>
                      <button
                        onClick={() => reload()}
                        className="mt-2 inline-flex rounded-full bg-rose-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-rose-800"
                      >
                        Reintentar
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-zinc-200 pt-4">
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-500">
                  <span className="rounded-full bg-cyan-50 px-2.5 py-1 font-semibold text-cyan-900 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.08)]">
                    Paso 1
                  </span>
                  <span>Escoge aseguradora, plan y luego describe síntomas y ciudad.</span>
                </div>

                {(selectedInsurance || selectedPlan) && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {selectedInsurance && (
                      <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 font-medium text-cyan-900 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.06)]">
                        {selectedCompany?.name}
                      </span>
                    )}
                    {selectedPlan && (
                      <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-medium text-amber-900 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.08)]">
                        {selectedPlanObject?.name}
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-4 space-y-4 rounded-2xl border border-zinc-200 bg-white p-4">
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
                        className="text-xs font-medium text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-700"
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
                    <div className="space-y-4">
                      <button
                        onClick={() => setSelectedPlan(null)}
                        className="text-xs font-medium text-zinc-500 underline underline-offset-4 transition-colors hover:text-zinc-700"
                      >
                        ← Cambiar plan
                      </button>
                      <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-800">
                          Selección actual
                        </div>
                        <p className="mt-2 text-sm text-zinc-700">
                          <span className="font-semibold text-cyan-900">Aseguradora:</span> {selectedCompany?.name}
                          <br />
                          <span className="font-semibold text-amber-900">Plan:</span> {selectedPlanObject?.name}
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
            </div>
          </section>
        </div>
      </main>

      <DisclaimerBanner variant="bottom" />
    </div>
  );
}
