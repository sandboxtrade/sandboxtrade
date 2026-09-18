import assert from 'node:assert/strict';
import { auditLedger, fromCents } from '../core/money-ledger.js';
import { createWorldCore } from '../core/world-core.js';
import {
  MONEY_ACCOUNTS,
  adoptLegacyBalances,
  balanceForLegacyAccount,
  payWorldCounterparty,
  receiveFromWorldCounterparty,
  reconcileLegacyDrift,
  transferLegacyMoney
} from '../core/player-money.js';

let core = createWorldCore();
// Simulate loading a v0.1/v13 save: balances are adopted once as opening money.
core = { ...core, bridge: { ...core.bridge, adoptedAt: null } };
core = adoptLegacyBalances(core, { ip: 10_000, priv: 5_000, bank: 25_000 });
assert.equal(balanceForLegacyAccount(core, 'ip'), 10_000);
assert.equal(balanceForLegacyAccount(core, 'priv'), 5_000);
assert.equal(balanceForLegacyAccount(core, 'bank'), 25_000);
assert.equal(auditLedger(core.ledger).ok, true);

// Player-to-player-account transfer: $1,000 total debit, $20 service fee.
core = transferLegacyMoney(core, 'ip', 'priv', 1_000, 'test transfer', { fee: 20 });
assert.equal(balanceForLegacyAccount(core, 'ip'), 9_000);
assert.equal(balanceForLegacyAccount(core, 'priv'), 5_980);
assert.equal(fromCents(core.ledger.accounts[MONEY_ACCOUNTS.services].cash), 20);
assert.equal(auditLedger(core.ledger).ok, true);

// Taxes are a real transfer to treasury.
const treasuryBefore = fromCents(core.ledger.accounts[MONEY_ACCOUNTS.treasury].cash);
core = payWorldCounterparty(core, 'priv', 500, MONEY_ACCOUNTS.treasury, 'test tax');
assert.equal(balanceForLegacyAccount(core, 'priv'), 5_480);
assert.equal(fromCents(core.ledger.accounts[MONEY_ACCOUNTS.treasury].cash), treasuryBefore + 500);
assert.equal(auditLedger(core.ledger).ok, true);

// Transitional legacy income is balanced against clearing, never minted silently.
core = receiveFromWorldCounterparty(core, 'ip', 250, MONEY_ACCOUNTS.clearing, 'legacy income');
assert.equal(balanceForLegacyAccount(core, 'ip'), 9_250);
assert.equal(fromCents(core.ledger.accounts[MONEY_ACCOUNTS.clearing].cash), -250);
assert.equal(auditLedger(core.ledger).ok, true);

// Safety reconciliation mirrors an old direct state mutation into clearing.
const beforeFallbacks = core.bridge.fallbackReconciliations;
core = reconcileLegacyDrift(core, { ip: 9_350, priv: 5_480, bank: 25_000 });
assert.equal(balanceForLegacyAccount(core, 'ip'), 9_350);
assert.equal(core.bridge.fallbackReconciliations, beforeFallbacks + 1);
assert.equal(auditLedger(core.ledger).ok, true);


// Repeated migrated transfers must never break the ledger identity.
for (let i = 0; i < 250; i += 1) {
  const from = i % 2 === 0 ? 'ip' : 'priv';
  const to = i % 2 === 0 ? 'priv' : 'ip';
  const available = balanceForLegacyAccount(core, from);
  const amount = Math.min(5, Math.max(0, available));
  if (amount > 0) core = transferLegacyMoney(core, from, to, amount, 'stress transfer');
  assert.equal(auditLedger(core.ledger).ok, true);
}

console.log('player-money.test.mjs: OK');
