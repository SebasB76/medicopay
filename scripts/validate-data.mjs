#!/usr/bin/env node

/**
 * Script de validación de integridad de datos
 * Verifica que todos los planes referenciados en hospitales existan
 * Ejecutar: node scripts/validate-data.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const companiesPath = path.join(__dirname, '../data/insurance-companies.json');
const plansPath = path.join(__dirname, '../data/plans.json');
const hospitalsPath = path.join(__dirname, '../data/hospitals.json');

// Leer datos
const companies = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));
const plans = JSON.parse(fs.readFileSync(plansPath, 'utf8'));
const hospitals = JSON.parse(fs.readFileSync(hospitalsPath, 'utf8'));

let errors = 0;
let warnings = 0;

console.log('🔍 Validando integridad de datos...\n');

// Validar planes contra insurance-companies.json
console.log('1️⃣ Verificando plans.json contra insurance-companies.json');
const companyPlans = new Map();
companies.forEach(company => {
  company.plans.forEach(plan => {
    const fullId = `${company.id}/${plan.id}`;
    companyPlans.set(plan.id, { company_id: company.id, plan });
  });
});

plans.forEach(plan => {
  if (!plan.company_id) {
    console.log(`  ⚠️  Plan "${plan.id}" sin company_id`);
    warnings++;
  } else {
    const expected = companyPlans.get(plan.id);
    if (!expected) {
      console.log(`  ❌ Plan "${plan.id}" no existe en insurance-companies.json`);
      errors++;
    }
  }
});

console.log(`   ✅ ${plans.length} planes validados\n`);

// Validar que hospitals acepten planes existentes
console.log('2️⃣ Verificando planes aceptados en hospitals.json');
const validPlanIds = new Set(plans.map(p => p.id));

hospitals.forEach(hospital => {
  hospital.accepted_plans.forEach(planId => {
    if (!validPlanIds.has(planId)) {
      console.log(`  ❌ Hospital "${hospital.name}" acepta plan inexistente "${planId}"`);
      errors++;
    }
  });
});

console.log(`   ✅ ${hospitals.length} hospitales validados\n`);

// Validar que todas las especialidades existan
console.log('3️⃣ Verificando especialidades en hospitales');
const validSpecialties = [
  'Medicina General', 'Emergencias', 'Cardiología', 'Ginecología', 'Pediatría',
  'Traumatología', 'Dermatología', 'Gastroenterología', 'Neurología', 'Oftalmología',
  'Otorrinolaringología', 'Psiquiatría', 'Endocrinología', 'Urología'
];

hospitals.forEach(hospital => {
  hospital.specialties.forEach(specialty => {
    if (!validSpecialties.includes(specialty)) {
      console.log(`  ⚠️  Hospital "${hospital.name}" tiene especialidad desconocida "${specialty}"`);
      warnings++;
    }
  });
});

console.log(`   ✅ Especialidades validadas\n`);

// Resumen
console.log('📊 RESUMEN:');
console.log(`  📦 Aseguradoras: ${companies.length}`);
console.log(`  📋 Planes: ${plans.length}`);
console.log(`  🏥 Hospitales: ${hospitals.length}`);
console.log(`  ❌ Errores: ${errors}`);
console.log(`  ⚠️  Advertencias: ${warnings}`);
console.log('');

if (errors > 0) {
  console.log('❌ Validación fallida - hay errores que deben corregirse');
  process.exit(1);
} else if (warnings > 0) {
  console.log('⚠️  Validación con advertencias - revisa los datos');
  process.exit(0);
} else {
  console.log('✅ Todos los datos son consistentes');
  process.exit(0);
}
