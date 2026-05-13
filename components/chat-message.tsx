"use client";

import type { Message } from "ai";
import type { RecommendationResult } from "@/lib/types";
import { RecommendationCard } from "./recommendation-card";

type InvocationLike = {
  toolName: string;
  state: string;
  result?: unknown;
};

export function ChatMessage({ message }: { message: Message }) {
  const isUser = message.role === "user";

  const toolResults: RecommendationResult[] = [];
  const invocations = (message as Message & { toolInvocations?: InvocationLike[] })
    .toolInvocations;
  if (Array.isArray(invocations)) {
    for (const inv of invocations) {
      if (inv.toolName === "recommend_hospitals" && inv.state === "result") {
        toolResults.push(inv.result as RecommendationResult);
      }
    }
  }

  const hasText = message.content && message.content.trim().length > 0;

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
      <div className="max-w-[90%] sm:max-w-[80%] space-y-2">
        {hasText && (
          <div
            className={`rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap leading-relaxed ${
              isUser ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-900"
            }`}
          >
            {message.content}
          </div>
        )}
        {toolResults.map((r, i) => (
          <RecommendationCard key={i} result={r} />
        ))}
      </div>
    </div>
  );
}
