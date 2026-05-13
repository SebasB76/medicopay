import { NextResponse } from 'next/server';
import { recommend } from '@/lib/retrieval';

type ReqBody = {
  message: string;
};

function parseMessage(msg: string) {
  // Esperamos formato: "Síntomas: ... . Aseguradora: ... . Plan: ... . Ciudad: ..."
  const parts = msg.split(/\.(?: |$)/).map((s) => s.trim()).filter(Boolean);
  const out: { symptoms?: string; plan?: string; city?: string; insurer?: string } = {};

  for (const p of parts) {
    if (/^síntomas?:/i.test(p)) {
      out.symptoms = p.replace(/^síntomas?:/i, '').trim();
    } else if (/^aseguradora:/i.test(p)) {
      out.insurer = p.replace(/^aseguradora:/i, '').trim();
    } else if (/^plan:/i.test(p)) {
      out.plan = p.replace(/^plan:/i, '').trim();
    } else if (/^ciudad:/i.test(p)) {
      out.city = p.replace(/^ciudad:/i, '').trim();
    }
  }

  return out;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody;
    const msg = body?.message;
    if (!msg) {
      return NextResponse.json({ error: 'missing message' }, { status: 400 });
    }

    const parsed = parseMessage(msg);
    const symptoms = parsed.symptoms || '';
    const plan = parsed.plan || parsed.insurer || '';
    const city = parsed.city || '';

    const result = recommend(symptoms, plan, city);

    if (result.kind === 'recommend') {
      const lines = [
        `Especialidad recomendada: ${result.specialty}.`,
        `Plan: ${result.plan_name}. Copago base estimado: $${result.base_copay_usd}.`,
        '',
        'Hospitales sugeridos:',
        ...result.hospitals.map((h) => `- ${h.name} — ${h.address} — Copago estimado: $${h.copay_estimate_usd}`),
        '',
        '⚠️ Esto no es consejo médico. Las estimaciones de copago son aproximadas; confirma con tu aseguradora.',
      ];

      return NextResponse.json({ reply: lines.join('\n') });
    }

    // For other kinds, produce a human-friendly response
    if (result.kind === 'needs') {
      return NextResponse.json({ reply: `Necesito que indiques ${result.what}. ¿Puedes proporcionarlo?` });
    }
    if (result.kind === 'unknown_plan') {
      return NextResponse.json({ reply: `No reconozco el plan "${result.provided}". Revisa la selección.` });
    }
    if (result.kind === 'no_match') {
      return NextResponse.json({ reply: `No encontramos hospitales: ${result.reason}` });
    }

    return NextResponse.json({ reply: 'No pude generar una recomendación en este momento.' }, { status: 500 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

