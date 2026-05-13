# MediCopay 🩺

Asistente conversacional en español que estima tu **copago médico** y te recomienda el **hospital adecuado en Ecuador**, según tus síntomas y tu seguro.

> Submission para hackIAthon (Viamatica).
> Reto: *Conversational agent that estimates copay, coverage and best hospital based on symptoms and insurance.*

Hablás con MediCopay en lenguaje natural ("Tengo fiebre y dolor de garganta, mi seguro es Sanitas Plus, estoy en Quito"), y te responde con:

- La **especialidad médica** recomendada.
- 2-3 **hospitales** que aceptan tu seguro en tu ciudad.
- Un **estimado del copago aproximado**.

⚠️ **Esto no es consejo médico.** Las estimaciones de copago son aproximadas. Confirma siempre con tu aseguradora. En emergencias llama al **911** o **171**.

---

## Demo

- **App pública:** _agregar URL de Vercel acá_
- **Repo:** _este mismo_

---

## Cómo correrlo en local

Requisitos: Node 22+ y pnpm 10+.

```bash
# 1) Clona e instala
git clone https://github.com/<tu-usuario>/medicopay.git
cd medicopay
pnpm install

# 2) Configura tu API key gratuita de Groq
cp .env.example .env.local
# Edita .env.local y pega tu key. Obtén una gratis en:
# https://console.groq.com/keys

# 3) Verifica que Groq + tool calling funciona (smoke test)
pnpm smoke:groq

# 4) Levanta el dev server
pnpm dev
# Abre http://localhost:3000
```

### Scripts útiles

| Comando | Qué hace |
|---|---|
| `pnpm dev` | Dev server Next.js en `localhost:3000` |
| `pnpm build` | Build de producción |
| `pnpm start` | Sirve el build de producción |
| `pnpm test` | Corre los tests con Vitest |
| `pnpm smoke:groq` | Verifica que la API key de Groq funciona |
| `pnpm lint` | Linter |
| `pnpm generate:plans` | Regenera `plans.json` desde `insurance-companies.json` |
| `pnpm validate:data` | Valida integridad de datos (planes, hospitales, especialidades) |

---

## Stack

- **Next.js 16** (App Router, Edge runtime para `/api/chat`)
- **Vercel AI SDK v4** (`streamText`, `useChat`, `tool`)
- **Groq** — modelo `llama-3.3-70b-versatile` (tier gratuito, latencia sub-segundo)
- **Zod** para schemas de tool calling
- **Tailwind v4** + componentes propios (sin shadcn)
- **Vitest** para tests de retrieval y matcher de síntomas

Costo total para correrlo: **$0**.

---

## Arquitectura (resumen)

```
Usuario
  │  (chat web, React + useChat)
  ▼
POST /api/chat (Edge runtime)
  │
  ▼
streamText (Vercel AI SDK)  ── system prompt en español ──┐
  │                                                       │
  ▼                                                       │
Groq llama-3.3-70b ←─── tool call ─── recommend_hospitals │
  │                                          │            │
  ▼                                          ▼            │
respuesta en español   ←──  resultado JSON  ←─ matchSpecialty
con tarjeta de         ←──                  └─ filter hospitales por
recomendación                                  plan + ciudad + especialidad
                                              └─ copago = base × modificador
```

### Lógica conversacional

El bot decide en el prompt cuándo:
- **Preguntar** por un dato que falta (seguro o ciudad).
- **Llamar a la herramienta** `recommend_hospitals(symptoms, plan_id, city)` cuando ya tiene los tres datos.
- **Activar alerta de emergencia** si los síntomas coinciden con keywords críticas (dolor de pecho, sangrado, etc.).

El backend nunca da diagnóstico médico, solo orienta a especialidad + hospital + copago aproximado, con disclaimer siempre visible.

---

## Datos: ¡son simulados!

Los datos de planes y hospitales son **mock-pero-plausibles** para esta demo. Los nombres de hospitales son reales (Hospital Metropolitano, Clínica Pichincha, etc.) pero las coberturas, copagos y red de aceptación de planes son ficticios y simplificados.

**Nueva estructura (v2):**
- **8 aseguradoras** con **20 planes totales** (múltiples niveles: básico, estándar, premium).
- **17 hospitales**: 8 en Quito + 5 en Guayaquil + 2 en Cuenca + 2 públicos (IESS).
- **14 especialidades** + Emergencias con sus keywords.

Carpetas y archivos:
- `data/insurance-companies.json` — **Principal**: estructura de aseguradoras con planes anidados.
- `data/plans.json` — **Generada automáticamente** desde insurance-companies.json (vista plana).
- `data/plans/` — descripciones legibles en markdown (referencia humana).
- `data/hospitals.json` — directorio de hospitales y planes aceptados.
- `data/specialties.json` — mapeo síntoma → especialidad.
- `scripts/generate-plans.mjs` — script para regenerar plans.json.
- `docs/INSURANCE-STRUCTURE.md` — documentación completa de la estructura.

Ver [Estructura de Aseguradoras y Planes](./docs/INSURANCE-STRUCTURE.md) para más detalles.

Reemplazar por datos reales en producción es 1-3 horas de trabajo si tuvieras acceso a la información oficial.

---

## Deploy en Vercel

1. Sube el repo a GitHub.
2. En vercel.com, **Import Project** → selecciona el repo.
3. En **Settings → Environment Variables** agrega:
   - `GROQ_API_KEY` = tu API key
4. Deploy.

El proyecto está pensado para correr en el **Edge runtime** (cold start <1s).

---

## Limitaciones conocidas (v2)

- Solo 3 ciudades: Quito, Guayaquil, Cuenca.
- 20 planes de 8 aseguradoras (datos simulados).
- Sin geolocalización, mapas en vivo, ni reservas de turno.
- Sin WhatsApp/voz (web chat por ahora).
- Sin guardar conversaciones — todo en memoria del cliente.

---

## Estructura de Datos v2: Múltiples Planes por Aseguradora

### Cambios Principales

Cada **aseguradora** ahora puede tener **múltiples planes** con diferentes niveles de cobertura:

```json
{
  "id": "sanitas",
  "name": "Sanitas",
  "type": "private",
  "plans": [
    {
      "id": "sanitas-basic",
      "name": "Sanitas Basic",
      "level": "basic",
      "copays": { "general": 30, "specialist": 45, "emergency": 75 }
    },
    {
      "id": "sanitas-standard",
      "name": "Sanitas Standard",
      "level": "standard",
      "copays": { "general": 25, "specialist": 35, "emergency": 50 }
    },
    {
      "id": "sanitas-plus",
      "name": "Sanitas Plus",
      "level": "premium",
      "copays": { "general": 20, "specialist": 30, "emergency": 0 }
    }
  ]
}
```

### Archivos de Datos

1. **`data/insurance-companies.json`** — Archivo principal con estructura de aseguradoras y planes anidados
2. **`data/plans.json`** — Vista plana generada automáticamente (para compatibilidad con el código)
3. **`data/hospitals.json`** — Hospitales y planes que aceptan
4. **`data/specialties.json`** — Mapeo síntoma → especialidad

### Generar y Validar Datos

```bash
# Regenerar plans.json si editas insurance-companies.json
pnpm generate:plans

# Validar integridad de todos los datos
pnpm validate:data
```

### Para Desarrolladores

**Acceder a todos los planes de una aseguradora:**

```typescript
import companiesData from "@/data/insurance-companies.json";

const sanitas = companiesData.find(c => c.id === "sanitas");
sanitas.plans.forEach(plan => {
  console.log(`${plan.name}: $${plan.copays.general}`);
});
// Output:
// Sanitas Basic: $30
// Sanitas Standard: $25
// Sanitas Plus: $20
```

**Buscar un plan específico:**

```typescript
import { findPlan } from "@/lib/retrieval";

const plan = findPlan("Sanitas Plus");
console.log(plan.company_name); // "Sanitas"
console.log(plan.level); // "premium"
```

Ver [Estructura de Aseguradoras y Planes](./docs/INSURANCE-STRUCTURE.md) y [Guía de Migración](./docs/MIGRATION-GUIDE.md) para más detalles.

---

```bash
pnpm test
```

16 tests cubren:
- Normalización de texto (acentos, mayúsculas, espacios).
- Matcher de especialidad (incluyendo prioridad de emergencias).
- Búsqueda de plan por nombre / alias.
- Retrieval para casos felices, edge cases (plan inválido, ciudad faltante) y emergencias.

---

## English summary

**MediCopay** is a Spanish-language conversational agent that estimates medical copay and recommends hospitals in Ecuador based on a patient's symptoms and insurance plan. Built for the hackIAthon (Viamatica) using Next.js 16, Vercel AI SDK v4, Groq's free `llama-3.3-70b-versatile` model, and Tailwind v4. Data for plans and hospitals is mock-but-plausible (real hospital names, fictional coverage and copays). **Not medical advice** — copay estimates are approximate. See Spanish sections above for setup and architecture.

---

## Licencia

MIT.
