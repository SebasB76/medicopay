# Estructura de Aseguradoras y Planes

## Overview

El sistema ahora soporta múltiples planes por aseguradora, permitiendo diferentes niveles de cobertura y copagos.

## Archivos de Datos

### `data/insurance-companies.json` (Principal)
Contiene la estructura completa de aseguradoras con sus planes anidados.

**Estructura:**
```json
{
  "id": "sanitas",
  "name": "Sanitas",
  "type": "private",
  "description": "Aseguradora privada con amplia cobertura a nivel nacional",
  "plans": [
    {
      "id": "sanitas-basic",
      "name": "Sanitas Basic",
      "level": "basic",
      "coverage_outpatient_pct": 60,
      "coverage_hospitalization_pct": 75,
      "coverage_emergency_pct": 85,
      "copays": {
        "general": 30,
        "specialist": 45,
        "emergency": 75
      },
      "summary": "Plan básico..."
    },
    ...
  ]
}
```

### `data/plans.json` (Generada)
Vista plana de todos los planes, generada desde `insurance-companies.json`.

Se regenera automáticamente ejecutando:
```bash
node scripts/generate-plans.mjs
```

## Aseguradoras Disponibles

### 1. Sanitas (Private)
- **Sanitas Basic** (Básico): Cobertura limitada, desde $30
- **Sanitas Standard** (Estándar): Buena cobertura, desde $25
- **Sanitas Plus** (Premium): Cobertura amplia, desde $20

### 2. Salud S.A. (Private)
- **Salud S.A. Essential** (Básico): Cobertura esencial, desde $25
- **Salud S.A. Premier** (Estándar): Buena relación precio-cobertura, desde $20
- **Salud S.A. Platinum** (Premium): Cobertura superior, desde $15

### 3. Confiamed (Private)
- **Confiamed Familiar** (Estándar): Enfoque familiar, desde $18
- **Confiamed Premium Familia** (Premium): Máxima cobertura familiar, desde $15

### 4. IESS (Public)
- **IESS Afiliado** (Estándar): Cobertura pública 100%, sin copagos

### 5. AXA (Private)
- **AXA Protect** (Estándar): Cobertura estándar con buen manejo de emergencias, desde $28
- **AXA Premium** (Premium): Cobertura superior, sin copago en emergencias, desde $25

### 6. Seguros Bolívar (Private)
- **Bolívar Flex** (Básico): Plan flexible con opciones de copagos, desde $25
- **Seguros Bolívar** (Estándar): Buena cobertura general, desde $22
- **Bolívar Elite** (Premium): Cobertura superior con beneficios, desde $20

### 7. Integra (Private)
- **Integra Basic** (Básico): Plan económico, desde $18
- **Integra Familiar** (Estándar): Buena relación precio-cobertura, desde $15
- **Integra Premium Familia** (Premium): Máxima cobertura familiar, desde $12

### 8. CajaSol (Cooperative)
- **CajaSol Essential** (Básico): Copagos muy bajos, desde $12
- **CajaSol Cooperativa** (Estándar): Beneficios de cooperativa, desde $10
- **CajaSol Premium Coop** (Premium): Máxima cobertura, desde $8

## Niveles de Cobertura

Cada plan tiene un nivel que indica su alcance:

| Nivel | Cobertura Consultas | Cobertura Hospitalización | Cobertura Emergencias |
|-------|-------------------|--------------------------|---------------------|
| **Basic** | 50-65% | 65-78% | 75-85% |
| **Standard** | 65-80% | 78-92% | 85-95% |
| **Premium** | 80-85%+ | 92-95%+ | 95-100% |

## Copagos Típicos

Los copagos varían según el nivel del plan:

```
                  Consulta General  Especialista  Emergencia
Basic             $18-30            $30-45        $45-75
Standard          $10-25            $20-35        $35-50
Premium           $0-25             $0-40         $0-40
```

## Integración en la Aplicación

### Búsqueda de Planes
La función `findPlan()` en `lib/retrieval.ts` busca planes por:
- ID exacto (ej: "sanitas-plus")
- Nombre (ej: "Sanitas Plus")
- Alias (ej: "sanitas", "sanitas premium")

Retorna información completa del plan incluyendo aseguradora asociada.

### Hospitals y Planes Aceptados
Cada hospital tiene un array `accepted_plans` con los IDs de planes que acepta:

```json
{
  "id": "metropolitano-quito",
  "name": "Hospital Metropolitano",
  "accepted_plans": [
    "sanitas-plus",
    "sanitas-standard",
    "salud-sa-premier",
    ...
  ]
}
```

## Scripts Disponibles

### Generar plans.json
```bash
node scripts/generate-plans.mjs
```

Regenera la vista plana de planes desde `insurance-companies.json`. Ejecutar después de modificar insurance-companies.json.

## Ejemplo de Uso

### Búsqueda de un plan específico
```javascript
import { findPlan } from "@/lib/retrieval";

const plan = findPlan("sanitas plus");
// Retorna información completa de Sanitas Plus con company_id: "sanitas"
```

### Comparar planes de la misma aseguradora
```javascript
const companies = require("@/data/insurance-companies.json");
const sanitas = companies.find(c => c.id === "sanitas");

// Accede a todos los planes de Sanitas
sanitas.plans.forEach(plan => {
  console.log(`${plan.name}: $${plan.copays.general} por consulta`);
});
```

### Encontrar hospitales que aceptan un plan
```javascript
import hospitalsData from "@/data/hospitals.json";

const hospitals = hospitalsData.filter(h => 
  h.accepted_plans.includes("sanitas-plus")
);
```

## Mantenimiento

### Agregar un nuevo plan a una aseguradora
1. Editar `data/insurance-companies.json`
2. Agregar el plan al array `plans` de la aseguradora
3. Ejecutar `node scripts/generate-plans.mjs`
4. Actualizar `data/hospitals.json` si es necesario

### Crear una nueva aseguradora
1. Agregar entrada en `data/insurance-companies.json`
2. Incluir al menos 1 plan
3. Ejecutar `node scripts/generate-plans.mjs`
4. Actualizar hospitales que aceptan esta aseguradora
