import assert from 'node:assert/strict';
import { auditLedger } from '../core/money-ledger.js';
import { createWorldCore, tickWorldCore } from '../core/world-core.js';
import { ECONOMY_ACCOUNTS, businessLedgerId, economyAccountBalance, ensureRealEconomy, settleB2BSale, settleMarketplacePulse, settleRetailSale, tickAggregateEconomyDay, worldDemandFactor } from '../core/real-economy.js';

let core = ensureRealEconomy(createWorldCore({ population: 1_000_000 }));
assert.equal(core.population.total, 1_000_000);
assert.ok(economyAccountBalance(core, ECONOMY_ACCOUNTS.households) > 1_000_000_000);
assert.ok(auditLedger(core.ledger).ok);

const beforeTotal = auditLedger(core.ledger).total;
const retail = settleRetailSale(core, { grossDollars: 1000, feeRate: 0.05, destinationAccount: 'player:business' });
core = retail.core;
assert.equal(retail.grossDollars, 1000);
assert.equal(retail.netDollars, 950);
assert.equal(retail.feeDollars, 50);
assert.equal(auditLedger(core.ledger).total, beforeTotal);

const factory = settleB2BSale(core, { destinationAccount: 'player:business', requestedDollars: 2500 });
core = factory.core;
assert.equal(factory.paidDollars, 2500);
assert.ok(auditLedger(core.ledger).ok);

const marketAccount = businessLedgerId('marketplace', 'main');
const pulse = settleMarketplacePulse(core, { marketplaceAccount: marketAccount, gmvDollars: 10000, revenueDollars: 500, opexDollars: 200 });
core = pulse.core;
assert.equal(pulse.gmvDollars, 10000);
assert.equal(pulse.revenueDollars, 500);
assert.equal(pulse.opexDollars, 200);
assert.equal(pulse.netDollars, 300);
assert.ok(auditLedger(core.ledger).ok);

const demand = worldDemandFactor(core, 1);
assert.ok(demand > 0.5 && demand < 1.5);
core = tickAggregateEconomyDay(core, { demandIndex: 1 });
assert.ok(core.economy.lastDailyFlow.wages > 0);
assert.ok(core.economy.lastDailyFlow.consumption > 0);
assert.ok(auditLedger(core.ledger).ok);

core = tickWorldCore(core, { days: 1, laborDemandIndex: 1, migrationPressure: 1, demandIndex: 1 });
assert.ok(auditLedger(core.ledger).ok);
console.log('real-economy tests passed');
