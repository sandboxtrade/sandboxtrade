import assert from 'node:assert/strict';
import { createLedger, ensureAccount, issue, transfer, auditLedger, toCents } from '../core/money-ledger.js';
import { createPopulationModel, tickPopulation, validatePopulationModel } from '../core/population-model.js';
import { createWorldCore, migrateWorldCore, tickWorldCore, validateWorldCore } from '../core/world-core.js';

{
  let ledger = createLedger({ mode: 'test' });
  ensureAccount(ledger, 'a', { opening: toCents(1000) });
  ensureAccount(ledger, 'b', { opening: 0 });
  ledger = transfer(ledger, 'a', 'b', toCents(125.50), 'test transfer');
  ledger = issue(ledger, 'b', toCents(10), 'test issuance');
  const audit = auditLedger(ledger);
  assert.equal(audit.ok, true);
  assert.equal(ledger.accounts.a.cash, toCents(874.50));
  assert.equal(ledger.accounts.b.cash, toCents(135.50));
}

{
  const population = createPopulationModel(1_000_000);
  assert.equal(population.total, 1_000_000);
  assert.equal(population.cohorts.length, 24);
  const next = tickPopulation(population, { days: 30, laborDemandIndex: 0.9, migrationPressure: 1 });
  validatePopulationModel(next);
  assert.ok(next.total > 900_000 && next.total < 1_100_000);
  assert.ok(next.metrics.unemploymentRate >= 0 && next.metrics.unemploymentRate <= 1);
}

{
  const core = createWorldCore();
  assert.equal(core.population.total, 1_000_000);
  validateWorldCore(core);
  const migrated = migrateWorldCore(null);
  assert.equal(migrated.population.total, 1_000_000);
  const next = tickWorldCore(core, { days: 1, laborDemandIndex: 1 });
  assert.equal(next.time.day, 1);
  validateWorldCore(next);
}

{
  const stage4 = createWorldCore();
  const stage3Like = { ...stage4, version: 3, finance: undefined, bridge: { ...stage4.bridge, phase: 3 } };
  const migrated = migrateWorldCore(stage3Like);
  assert.equal(migrated.version, 4);
  assert.equal(migrated.bridge.phase, 4);
  assert.ok(migrated.ledger.accounts['world:exchange-liquidity']);
  validateWorldCore(migrated);
}

console.log('core-world.test.mjs: OK');
