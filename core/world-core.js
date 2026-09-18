import { auditLedger, createLedger, ensureAccount } from './money-ledger.js';
import { ensureStage2Ledger } from './player-money.js';
import { DEFAULT_POPULATION, createPopulationModel, tickPopulation, validatePopulationModel } from './population-model.js';
import { ensureRealEconomy, tickAggregateEconomyDay } from './real-economy.js';
import { ensureStage4Finance } from './finance-engine.js';

export const WORLD_CORE_VERSION = 4;

function seedLedger() {
  let ledger = createLedger({ mode: 'stage4-finance' });
  ensureAccount(ledger, 'player:personal', { name: 'Player personal root', type: 'player-root' });
  ensureAccount(ledger, 'player:business', { name: 'Player business account', type: 'business' });
  ensureAccount(ledger, 'world:households', { name: 'Households aggregate', type: 'households' });
  ensureAccount(ledger, 'world:companies', { name: 'Companies aggregate', type: 'companies' });
  ensureAccount(ledger, 'world:banks', { name: 'Banks aggregate', type: 'banks' });
  ensureAccount(ledger, 'world:treasury', { name: 'Treasury', type: 'state' });
  ensureAccount(ledger, 'world:cb', { name: 'Central bank', type: 'central-bank' });
  ledger = ensureStage2Ledger(ledger);
  return ledger;
}

function stage4Bridge(base = {}) {
  return {
    ...base,
    phase: 4,
    authoritativeMoney: 'world-core-ledger',
    migratedSystems: [
      'player-payment-accounts', 'player-business-cash', 'transfers', 'taxes', 'fines', 'player-purchases',
      'population-demand', 'retail-sales', 'factory-b2b', 'warehouse-revenue',
      'owned-bank-cash', 'bank-deposits', 'bank-loans', 'exchange-settlement', 'marketplace-cash'
    ],
    notes: 'Stage 4: primary playable vertical slice uses real counterparties for bank deposits/loans, exchange settlement and marketplace cash. Secondary legacy systems may still reconcile through the bridge.',
    moneyVersion: 2,
    fallbackReconciliations: base.fallbackReconciliations || 0
  };
}

export function createWorldCore({ population = DEFAULT_POPULATION } = {}) {
  const base = {
    version: WORLD_CORE_VERSION,
    mode: 'bridge',
    time: { day: 0, lastTickAt: Date.now() },
    population: createPopulationModel(population),
    ledger: seedLedger(),
    bridge: stage4Bridge({ adoptedAt: Date.now() }),
    diagnostics: { lastAuditAt: 0, ledgerError: 0 }
  };
  return ensureStage4Finance(ensureRealEconomy(base));
}

function upgradeV1(input) {
  const ledger = ensureStage2Ledger(input.ledger || seedLedger());
  return {
    ...input,
    version: 2,
    ledger,
    bridge: {
      ...(input.bridge || {}),
      phase: Math.max(1, input.bridge?.phase || 1),
      moneyVersion: input.bridge?.moneyVersion || 0,
      fallbackReconciliations: input.bridge?.fallbackReconciliations || 0
    }
  };
}

function upgradeV2(input) {
  const stage3 = {
    ...input,
    version: 3,
    ledger: ensureStage2Ledger(input.ledger || seedLedger()),
    bridge: { ...(input.bridge || {}), phase: 3 }
  };
  return ensureRealEconomy(stage3);
}

function upgradeV3(input) {
  const stage4 = {
    ...input,
    version: WORLD_CORE_VERSION,
    ledger: ensureStage2Ledger(input.ledger || seedLedger()),
    bridge: stage4Bridge(input.bridge || {})
  };
  return ensureStage4Finance(ensureRealEconomy(stage4));
}

export function migrateWorldCore(input) {
  if (!input || typeof input !== 'object') return createWorldCore();
  let next = input;
  if (next.version === 1) next = upgradeV1(next);
  if (next.version === 2) next = upgradeV2(next);
  if (next.version === 3) next = upgradeV3(next);
  if (next.version !== WORLD_CORE_VERSION) return createWorldCore({ population: next.population?.total || DEFAULT_POPULATION });
  next = ensureRealEconomy({
    ...next,
    ledger: ensureStage2Ledger(next.ledger),
    population: validatePopulationModel(next.population),
    bridge: stage4Bridge(next.bridge || {})
  });
  next = ensureStage4Finance(next);
  return validateWorldCore(next);
}

export function tickWorldCore(input, { days = 1, laborDemandIndex = 1, migrationPressure = 1, demandIndex = 1 } = {}) {
  const core = migrateWorldCore(input);
  const population = tickPopulation(core.population, { days, laborDemandIndex, migrationPressure });
  let next = {
    ...core,
    time: { day: (core.time?.day || 0) + days, lastTickAt: Date.now() },
    population
  };
  // One game-day tick represents a full aggregate background economy day. Player
  // businesses compete for a small piece of this same household/company money pool.
  for (let i = 0; i < Math.max(1, Math.floor(days)); i += 1) next = tickAggregateEconomyDay(next, { demandIndex });
  const audit = auditLedger(next.ledger);
  return {
    ...next,
    diagnostics: { ...(next.diagnostics || {}), lastAuditAt: Date.now(), ledgerError: audit.error }
  };
}

export function validateWorldCore(core) {
  if (!core || core.version !== WORLD_CORE_VERSION) throw new Error('Invalid World Core version');
  const population = validatePopulationModel(core.population);
  const normalized = ensureStage4Finance(ensureRealEconomy({ ...core, population }));
  const ledgerAudit = auditLedger(normalized.ledger);
  if (!ledgerAudit.ok) throw new Error(`World Core ledger mismatch: ${ledgerAudit.error}`);
  return {
    ...normalized,
    diagnostics: { ...(normalized.diagnostics || {}), ledgerError: ledgerAudit.error }
  };
}
