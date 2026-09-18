import assert from 'node:assert/strict';
import { auditLedger, fromCents } from '../core/money-ledger.js';
import { createWorldCore } from '../core/world-core.js';
import { adoptLegacyBalances, balanceForLegacyAccount, MONEY_ACCOUNTS } from '../core/player-money.js';
import { ECONOMY_ACCOUNTS } from '../core/real-economy.js';
import {
  FINANCE_ACCOUNTS,
  adoptOwnedBankCash,
  settleExchangeTrade,
  settleOwnedBankDepositInflow,
  settleOwnedBankDepositPayout,
  settleOwnedBankLoanIssue,
  settleOwnedBankRepayment
} from '../core/finance-engine.js';

let core = createWorldCore({ population: 1_000_000 });
assert.equal(core.version, 4);
assert.ok(core.ledger.accounts[FINANCE_ACCOUNTS.exchange]);
assert.equal(auditLedger(core.ledger).ok, true);

// Adopt existing visible player balances once, as a migrated save would.
core = { ...core, bridge: { ...core.bridge, adoptedAt: null } };
core = adoptLegacyBalances(core, { ip: 200_000, priv: 50_000, bank: 0 });
core = adoptOwnedBankCash(core, {
  capital: 1_000_000,
  depositReserve: 100_000,
  creditPoolAllocated: 200_000,
  cardCreditPoolAllocated: 50_000
});
const bankStart = fromCents(core.ledger.accounts[MONEY_ACCOUNTS.ownedBank].cash);
assert.equal(bankStart, 1_350_000);
assert.equal(auditLedger(core.ledger).ok, true);

const householdsBefore = fromCents(core.ledger.accounts[ECONOMY_ACCOUNTS.households].cash);
let flow = settleOwnedBankDepositInflow(core, 25_000, { test: true });
core = flow.core;
assert.equal(flow.paidDollars, 25_000);
assert.equal(fromCents(core.ledger.accounts[MONEY_ACCOUNTS.ownedBank].cash), bankStart + 25_000);
assert.equal(fromCents(core.ledger.accounts[ECONOMY_ACCOUNTS.households].cash), householdsBefore - 25_000);

const companiesBeforeLoan = fromCents(core.ledger.accounts[ECONOMY_ACCOUNTS.companies].cash);
flow = settleOwnedBankLoanIssue(core, 100_000, { test: true });
core = flow.core;
assert.equal(flow.paidDollars, 100_000);
assert.equal(fromCents(core.ledger.accounts[ECONOMY_ACCOUNTS.companies].cash), companiesBeforeLoan + 100_000);

flow = settleOwnedBankRepayment(core, 12_500, { test: true });
core = flow.core;
assert.equal(flow.paidDollars, 12_500);

flow = settleOwnedBankDepositPayout(core, 10_000, { test: true });
core = flow.core;
assert.equal(flow.paidDollars, 10_000);
assert.equal(auditLedger(core.ledger).ok, true);

// Exchange buy and sell have a real counterparty pool, not clearing/minting.
const ipBeforeBuy = balanceForLegacyAccount(core, 'ip');
let trade = settleExchangeTrade(core, { legacyAccountId: 'ip', side: 'buy', cashDollars: 20_000, reason: 'test buy' });
core = trade.core;
assert.equal(trade.paidDollars, 20_000);
assert.equal(balanceForLegacyAccount(core, 'ip'), ipBeforeBuy - 20_000);

trade = settleExchangeTrade(core, { legacyAccountId: 'ip', side: 'sell', cashDollars: 7_500, reason: 'test sell' });
core = trade.core;
assert.equal(trade.paidDollars, 7_500);
assert.equal(balanceForLegacyAccount(core, 'ip'), ipBeforeBuy - 12_500);
assert.equal(auditLedger(core.ledger).ok, true);
assert.equal(core.diagnostics?.ledgerError || 0, 0);

console.log('finance-engine.test.mjs: OK');
