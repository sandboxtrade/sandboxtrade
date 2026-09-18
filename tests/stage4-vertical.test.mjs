import assert from 'node:assert/strict';
import { auditLedger, fromCents } from '../core/money-ledger.js';
import { createWorldCore, tickWorldCore } from '../core/world-core.js';
import { adoptLegacyBalances, balanceForLegacyAccount } from '../core/player-money.js';
import {
  ECONOMY_ACCOUNTS,
  adoptBusinessOpeningBalance,
  businessLedgerId,
  settleMarketplacePulse,
  transferBusinessCash
} from '../core/real-economy.js';
import {
  adoptOwnedBankCash,
  settleExchangeTrade,
  settleOwnedBankDepositInflow,
  settleOwnedBankLoanIssue,
  settleOwnedBankRepayment
} from '../core/finance-engine.js';

let core = createWorldCore({ population: 1_000_000 });
core = { ...core, bridge: { ...core.bridge, adoptedAt: null } };
core = adoptLegacyBalances(core, { ip: 500_000, priv: 100_000, bank: 0 });
core = adoptOwnedBankCash(core, { capital: 2_000_000, depositReserve: 0, creditPoolAllocated: 0, cardCreditPoolAllocated: 0 });
core = adoptBusinessOpeningBalance(core, { kind: 'marketplace', id: 'mp-test', dollars: 50_000, name: 'Test marketplace' });
const initialTotal = auditLedger(core.ledger).total;
const marketplaceId = businessLedgerId('marketplace', 'mp-test');

for (let day = 0; day < 365; day += 1) {
  core = tickWorldCore(core, {
    days: 1,
    laborDemandIndex: 0.92 + (day % 8) * 0.01,
    migrationPressure: 1,
    demandIndex: 0.95 + (day % 5) * 0.02
  });

  if (day % 5 === 0) core = settleOwnedBankDepositInflow(core, 2_000, { day }).core;
  if (day % 10 === 0) core = settleOwnedBankLoanIssue(core, 5_000, { day }).core;
  if (day % 10 === 5) core = settleOwnedBankRepayment(core, 2_500, { day }).core;

  if (day % 3 === 0) {
    const buy = settleExchangeTrade(core, { legacyAccountId: 'ip', side: 'buy', cashDollars: 250, reason: 'vertical buy', meta: { day } });
    core = buy.core;
  }
  if (day % 7 === 0) {
    const sell = settleExchangeTrade(core, { legacyAccountId: 'ip', side: 'sell', cashDollars: 125, reason: 'vertical sell', meta: { day } });
    core = sell.core;
  }

  const pulse = settleMarketplacePulse(core, {
    marketplaceAccount: marketplaceId,
    gmvDollars: 1_000 + day * 2,
    revenueDollars: 45 + day * 0.05,
    opexDollars: 12,
    meta: { day }
  });
  core = pulse.core;

  if (day % 30 === 29) {
    const payout = transferBusinessCash(core, {
      fromAccount: marketplaceId,
      toAccount: 'player:business',
      amountDollars: Math.min(500, fromCents(core.ledger.accounts[marketplaceId].cash)),
      reason: 'vertical marketplace payout'
    });
    core = payout.core;
  }

  const audit = auditLedger(core.ledger);
  assert.equal(audit.ok, true);
  assert.equal(audit.total, initialTotal);
}

assert.equal(core.population.cohorts.length, 24);
assert.ok(core.population.total > 900_000 && core.population.total < 1_100_000);
assert.ok(balanceForLegacyAccount(core, 'ip') >= 0);
assert.ok(fromCents(core.ledger.accounts[ECONOMY_ACCOUNTS.households].cash) > 0);
assert.equal(core.diagnostics.ledgerError, 0);
console.log('stage4-vertical.test.mjs: OK');
