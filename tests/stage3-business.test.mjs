import assert from 'node:assert/strict';
import { auditLedger, fromCents } from '../core/money-ledger.js';
import { createWorldCore, tickWorldCore } from '../core/world-core.js';
import {
  ECONOMY_ACCOUNTS,
  adoptBusinessOpeningBalance,
  businessLedgerId,
  settleB2BSale,
  settleBusinessExpense,
  settleRetailSale,
  transferBusinessCash,
  worldDemandFactor
} from '../core/real-economy.js';

let core = createWorldCore({ population: 1_000_000 });
const initialTotal = auditLedger(core.ledger).total;
const ipBefore = fromCents(core.ledger.accounts['player:business'].cash);

// A shop sale is paid by households and the platform fee goes to NPC companies.
for (let i = 0; i < 100; i += 1) {
  core = settleRetailSale(core, {
    grossDollars: 250,
    feeRate: 0.045,
    destinationAccount: 'player:business',
    reason: 'stage3 retail test'
  }).core;
}
assert.ok(fromCents(core.ledger.accounts['player:business'].cash) > ipBefore);
assert.ok(auditLedger(core.ledger).ok);

// Factory orders are paid by the finite NPC-company pool.
const b2b = settleB2BSale(core, { destinationAccount: 'player:business', requestedDollars: 50_000, reason: 'stage3 factory test' });
core = b2b.core;
assert.equal(b2b.paidDollars, 50_000);

// Warehouse cash is held separately and can later be withdrawn to the IP account.
const warehouseId = businessLedgerId('warehouse', 'test-1');
const whRevenue = settleB2BSale(core, { destinationAccount: warehouseId, requestedDollars: 12_000, reason: 'stage3 warehouse test' });
core = whRevenue.core;
assert.equal(whRevenue.paidDollars, 12_000);
const whMove = transferBusinessCash(core, { fromAccount: warehouseId, toAccount: 'player:business', amountDollars: 7_000, reason: 'warehouse payout' });
core = whMove.core;
assert.equal(whMove.paidDollars, 7_000);
assert.equal(fromCents(core.ledger.accounts[warehouseId].cash), 5_000);

// Payroll really returns player-business cash to households.
const householdBeforePayroll = fromCents(core.ledger.accounts[ECONOMY_ACCOUNTS.households].cash);
const payroll = settleBusinessExpense(core, { fromAccount: 'player:business', requestedDollars: 1_000, recipient: ECONOMY_ACCOUNTS.households, reason: 'warehouse payroll test' });
core = payroll.core;
assert.equal(payroll.paidDollars, 1_000);
assert.equal(fromCents(core.ledger.accounts[ECONOMY_ACCOUNTS.households].cash), householdBeforePayroll + 1_000);

// Legacy warehouse payout adoption is one-time even after the account is spent down.
let migrated = createWorldCore({ population: 1_000_000 });
migrated = adoptBusinessOpeningBalance(migrated, { kind: 'warehouse', id: 'legacy', dollars: 4_500 });
const adoptedId = businessLedgerId('warehouse', 'legacy');
assert.equal(fromCents(migrated.ledger.accounts[adoptedId].cash), 4_500);
migrated = adoptBusinessOpeningBalance(migrated, { kind: 'warehouse', id: 'legacy', dollars: 9_999 });
assert.equal(fromCents(migrated.ledger.accounts[adoptedId].cash), 4_500);

// Population scale affects consumer demand without materializing a million objects.
const half = createWorldCore({ population: 500_000 });
const full = createWorldCore({ population: 1_000_000 });
assert.ok(worldDemandFactor(full, 1) > worldDemandFactor(half, 1));
assert.equal(full.population.cohorts.length, 24);

// Long run: money remains conserved and the aggregate company sector is not drained to zero.
for (let day = 0; day < 365; day += 1) {
  core = tickWorldCore(core, {
    days: 1,
    laborDemandIndex: 0.95 + Math.sin(day / 30) * 0.05,
    migrationPressure: 1,
    demandIndex: 0.95 + Math.sin(day / 20) * 0.1
  });
  assert.ok(auditLedger(core.ledger).ok);
}
assert.equal(auditLedger(core.ledger).total, initialTotal);
assert.ok(fromCents(core.ledger.accounts[ECONOMY_ACCOUNTS.companies].cash) > 1_000_000_000);
assert.ok(core.population.total > 900_000 && core.population.total < 1_100_000);

console.log('stage3-business.test.mjs: OK');
