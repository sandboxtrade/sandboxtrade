import assert from 'node:assert/strict';
import { auditLedger, fromCents } from '../core/money-ledger.js';
import { createWorldCore, migrateWorldCore, tickWorldCore } from '../core/world-core.js';
import {
  MONEY_ACCOUNTS,
  balanceForLegacyAccount,
  payWorldCounterparty,
  receiveFromWorldCounterparty
} from '../core/player-money.js';
import {
  ECONOMY_ACCOUNTS,
  adoptBusinessOpeningBalance,
  businessLedgerId,
  settleMarketplacePulse,
  settleRetailSale,
  transferBusinessCash
} from '../core/real-economy.js';
import {
  adoptOwnedBankCash,
  settleExchangeTrade,
  settleOwnedBankDepositInflow,
  settleOwnedBankLoanIssue,
  settleOwnedBankRepayment
} from '../core/finance-engine.js';

// Fresh-run vertical slice: start -> first shop -> revenue -> bank -> exchange -> marketplace -> save/load.
let core = createWorldCore({ population: 1_000_000 });
const total0 = auditLedger(core.ledger).total;

// Explicit starting endowment comes from treasury, never clearing.
core = receiveFromWorldCounterparty(core, 'starter-card', 2_000, MONEY_ACCOUNTS.treasury, 'playtest starting endowment');
assert.equal(balanceForLegacyAccount(core, 'starter-card'), 2_000);
core = payWorldCounterparty(core, 'starter-card', 1_600, ECONOMY_ACCOUNTS.services, 'open first shop');
assert.equal(balanceForLegacyAccount(core, 'starter-card'), 400);

// Move working capital into IP and make household-funded shop sales.
core = receiveFromWorldCounterparty(core, 'ip', 300, ECONOMY_ACCOUNTS.companies, 'initial business funding');
for (let i = 0; i < 60; i += 1) {
  core = settleRetailSale(core, {
    grossDollars: 35,
    feeRate: 0.045,
    destinationAccount: MONEY_ACCOUNTS.business,
    reason: 'playtest shop sale'
  }).core;
  if (i % 10 === 0) core = tickWorldCore(core, { days: 1, demandIndex: 1 });
  assert.equal(auditLedger(core.ledger).ok, true);
}
assert.ok(balanceForLegacyAccount(core, 'ip') > 300);

// Own bank can receive deposits, issue and recover a loan without minting cash.
core = adoptOwnedBankCash(core, { capital: 50_000, depositReserve: 0, creditPoolAllocated: 0, cardCreditPoolAllocated: 0 });
core = settleOwnedBankDepositInflow(core, 5_000).core;
core = settleOwnedBankLoanIssue(core, 7_500).core;
core = settleOwnedBankRepayment(core, 1_000).core;

// Exchange settlement uses real liquidity.
let trade = settleExchangeTrade(core, { legacyAccountId: 'ip', side: 'buy', cashDollars: 250, reason: 'playtest exchange buy' });
core = trade.core;
assert.equal(trade.paidDollars, 250);
trade = settleExchangeTrade(core, { legacyAccountId: 'ip', side: 'sell', cashDollars: 100, reason: 'playtest exchange sell' });
core = trade.core;
assert.equal(trade.paidDollars, 100);

// Marketplace separates GMV, commission and operating cash.
core = adoptBusinessOpeningBalance(core, { kind: 'marketplace', id: 'gate', dollars: 2_500, name: 'Gate Marketplace' });
const mp = businessLedgerId('marketplace', 'gate');
const pulse = settleMarketplacePulse(core, {
  marketplaceAccount: mp,
  gmvDollars: 4_000,
  revenueDollars: 180,
  opexDollars: 75
});
core = pulse.core;
assert.equal(pulse.gmvDollars, 4_000);
assert.ok(pulse.revenueDollars > 0 && pulse.revenueDollars < pulse.gmvDollars);
const payout = transferBusinessCash(core, { fromAccount: mp, toAccount: MONEY_ACCOUNTS.business, amountDollars: 100, reason: 'playtest marketplace payout' });
core = payout.core;
assert.equal(payout.paidDollars, 100);

// Save/reload round trip preserves authoritative balances and population architecture.
const beforeSaveTotal = auditLedger(core.ledger).total;
const beforeSaveIp = balanceForLegacyAccount(core, 'ip');
const beforeSaveMp = fromCents(core.ledger.accounts[mp].cash);
const serialized = JSON.stringify(core);
const restored = migrateWorldCore(JSON.parse(serialized));
assert.equal(balanceForLegacyAccount(restored, 'ip'), beforeSaveIp);
assert.equal(fromCents(restored.ledger.accounts[mp].cash), beforeSaveMp);
assert.equal(restored.population.cohorts.length, 24);
assert.ok(restored.population.total > 900_000);
assert.equal(auditLedger(restored.ledger).ok, true);
assert.equal(auditLedger(restored.ledger).total, beforeSaveTotal);

console.log('playtest-gate.test.mjs: OK');
