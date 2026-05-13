# Guía de Actualización: Nueva Estructura de Datos (v1 → v2)

## Resumen de Cambios

El proyecto ha sido actualizado para soportar **múltiples planes por aseguradora** con diferentes niveles de cobertura (básico, estándar, premium).

## Archivos Modificados

### 1. **Archivos de Datos**
- ✅ `data/insurance-companies.json` - Nuevo: estructura principal con aseguradoras y planes anidados
- ✅ `data/plans.json` - Generada automáticamente desde insurance-companies.json (vista plana)
- ✅ `data/hospitals.json` - Actualizado: referencias a los nuevos IDs de planes

### 2. **Archivos de Código**

#### `lib/types.ts`
**Cambios:**
- Plan ahora es más flexible:
  - Campos opcionales: `level`, `company_id`, `company_name`, `company_type`, `aliases`
  - Soporta aseguradoras tipo "private", "public" o "cooperative"
  - Mantiene compatibilidad hacia atrás con el antiguo campo `type`

```typescript
export type Plan = {
  id: string;
  name: string;
  level?: "basic" | "standard" | "premium";
  copays: { general, specialist, emergency };
  company_id?: string;
  company_name?: string;
  company_type?: "private" | "public" | "cooperative";
  aliases?: string[];
  type?: "private" | "public" | "cooperative"; // Compatibilidad
}
```

#### `lib/retrieval.ts`
**Cambios:**
- `findPlan()` mejorada para manejar búsquedas defensivas
- Manejo de `aliases` como array opcional
- Sin cambios en la lógica de recomendación

```typescript
// Defensivo ante aliases undefined
(p.aliases || []).some((a) => normalizeText(a) === normalized)
```

#### `lib/prompts.ts`
**Cambios:**
- Importa tanto `plans.json` como `insurance-companies.json`
- Agrupa planes por aseguradora en el SYSTEM_PROMPT
- Mejor presentación de opciones al usuario

```typescript
// Estructura de datos (antes):
- Sanitas Plus (privado): copago general $20...
- Salud S.A. Premier (privado): copago general $20...

// Estructura de datos (después):
- Sanitas (privado): Sanitas Basic (copago $30), Sanitas Standard (copago $25), Sanitas Plus (copago $20)
- Salud S.A. (privado): Salud S.A. Essential (copago $25), Salud S.A. Premier (copago $20), Salud S.A. Platinum (copago $15)
```

### 3. **Scripts**
- ✅ `scripts/generate-plans.mjs` - Nuevo: regenera plans.json desde insurance-companies.json

### 4. **Documentación**
- ✅ `docs/INSURANCE-STRUCTURE.md` - Documentación completa de la nueva estructura
- ✅ `README.md` - Actualizado con referencias a la nueva estructura

### 5. **Tests**
- ✅ `tests/retrieval.test.ts` - Actualizado para trabajar con nuevos IDs de planes

## Impacto en Componentes

### Componentes No Modificados
Los siguientes componentes siguieren funcionando sin cambios:
- `components/chat-message.tsx` - Solo consume datos
- `components/recommendation-card.tsx` - Solo muestra datos
- `components/disclaimer-banner.tsx` - Sin cambios
- `app/page.tsx` - Sin cambios
- `app/api/chat/route.ts` - Sin cambios

## Guía de Uso

### Para el Usuario Final
La aplicación permite:
1. Ingresar síntomas
2. Seleccionar aseguradora y plan (ej: "Sanitas Plus")
3. Seleccionar ciudad
4. Recibir recomendaciones de especialidad y hospital

### Para Desarrolladores

#### Buscar un plan específico
```typescript
import { findPlan } from "@/lib/retrieval";

const plan = findPlan("Sanitas Plus");
console.log(plan.company_name); // "Sanitas"
console.log(plan.level); // "premium"
```

#### Acceder a todos los planes de una aseguradora
```typescript
import companiesData from "@/data/insurance-companies.json";

const sanitas = companiesData.find(c => c.id === "sanitas");
sanitas.plans.forEach(plan => {
  console.log(`${plan.name}: $${plan.copays.general}`);
});
```

#### Regenerar plans.json después de cambios
```bash
node scripts/generate-plans.mjs
```

## Datos Actuales

- **8 aseguradoras**: Sanitas, Salud S.A., Confiamed, IESS, AXA, Seguros Bolívar, Integra, CajaSol
- **20 planes**: 2-3 planes por aseguradora (básico, estándar, premium)
- **17 hospitales**: En Quito, Guayaquil y Cuenca
- **Tests**: 16/16 ✅
- **TypeScript**: Sin errores ✅

## Compatibilidad hacia Atrás

El código mantiene compatibilidad con el antiguo formato:
- El campo `type` en planes sigue siendo válido (aunque redundante con `company_type`)
- La lógica de búsqueda de planes es más robusta pero comportamiento idéntico
- Los datos de hospitals siguen siendo compatibles

## Próximos Pasos (Opcionales)

1. **Ampliar a más ciudades**: Agregar más hospitales en ciudades como Cuenca, Ambato, etc.
2. **Más aseguradoras**: Agregar más planes siguiendo el patrón de `insurance-companies.json`
3. **Base de datos**: Migrar de JSON a una base de datos si se escala
4. **API externa**: Integrar con APIs reales de aseguradoras si se dispone

## Troubleshooting

### Tests fallando
```bash
npm test
```
Si falla, ejecutar:
```bash
node scripts/generate-plans.mjs
npm test
```

### TypeScript errores
```bash
npx tsc --noEmit
```

### Planes no encontrados
Asegurar que:
1. El ID del plan existe en `plans.json`
2. El hospital acepta ese plan en `hospitals.json`
3. La ciudad está soportada (Quito, Guayaquil, Cuenca)
