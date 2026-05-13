#!/usr/bin/env node

/**
 * Script para generar plans.json (vista plana) desde insurance-companies.json
 * Ejecutar: node scripts/generate-plans.mjs
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const companiesPath = path.join(__dirname, '../data/insurance-companies.json');
const plansPath = path.join(__dirname, '../data/plans.json');

// Leer insurance-companies.json
const companiesData = JSON.parse(fs.readFileSync(companiesPath, 'utf8'));

// Generar plans plana
const plans = [];
companiesData.forEach(company => {
  company.plans.forEach(plan => {
    plans.push({
      ...plan,
      company_id: company.id,
      company_name: company.name,
      company_type: company.type,
      aliases: [
        plan.name.toLowerCase(),
        plan.id,
        company.name.toLowerCase(),
        `${company.name} ${plan.name}`.toLowerCase()
      ]
    });
  });
});

// Escribir plans.json
fs.writeFileSync(plansPath, JSON.stringify(plans, null, 2));
console.log(`✓ Generado ${plans.length} planes en ${plansPath}`);
