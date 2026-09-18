import { auditLedger, cloneLedger, ensureAccount, fromCents, rebaseAccountCash, toCents, transfer } from './money-ledger.js';

export const STAGE2_MONEY_VERSION = 1;

export const MONEY_ACCOUNTS = {
  business: 'player:business',
  ownedBank: 'player:owned-bank',
  offshore: 'player:offshore',
  treasury: 'world:treasury',
  companies: 'world:companies',
  banks: 'world:banks',
  services: 'world:payment-services',
  clearing: 'bridge:legacy-clearing'
};

export function ledgerIdForLegacyAccount(accountId) {
  if (accountId === 'ip') return MONEY_ACCOUNTS.business;
  if (accountId === 'bank') return MONEY_ACCOUNTS.ownedBank;
  if (accountId === 'grey') return MONEY_ACCOUNTS.offshore;
  return `player:account:${String(accountId)}`;
}

function accountLabel(accountId) {
  if (accountId === 'ip') return 'Player business account';
  if (accountId === 'bank') return 'Player-owned bank capital';
  if (accountId === 'grey') return 'Player offshore account';
  return `Player account ${accountId}`;
}

export function ensureStage2Ledger(ledgerInput, legacyAccountIds = []) {
  const ledger = cloneLedger(ledgerInput);
  ensureAccount(ledger, MONEY_ACCOUNTS.business, { name: 'Player business account', type: 'business' });
  ensureAccount(ledger, MONEY_ACCOUNTS.ownedBank, { name: 'Player-owned bank capital', type: 'bank-capital' });
  ensureAccount(ledger, MONEY_ACCOUNTS.offshore, { name: 'Player offshore account', type: 'offshore' });
  ensureAccount(ledger, MONEY_ACCOUNTS.treasury, { name: 'Treasury', type: 'state' });
  ensureAccount(ledger, MONEY_ACCOUNTS.companies, { name: 'Companies aggregate', type: 'companies' });
  ensureAccount(ledger, MONEY_ACCOUNTS.banks, { name: 'Banks aggregate', type: 'banks' });
  ensureAccount(ledger, MONEY_ACCOUNTS.services, { name: 'Payment and service providers', type: 'services' });
  ensureAccount(ledger, MONEY_ACCOUNTS.clearing, { name: 'Legacy systems clearing', type: 'migration-bridge', allowNegative: true });
  for (const id of legacyAccountIds) {
    const ledgerId = ledgerIdForLegacyAccount(id);
    ensureAccount(ledger, ledgerId, { name: accountLabel(id), type: id === 'ip' ? 'business' : 'player-account' });
  }
  ledger.mode = 'stage2-player-money';
  return ledger;
}

export function snapshotLegacyBalances({ ipCash = 0, bankAccounts = {}, greyAccount = null, muleCards = {}, fakeIps = {}, ownedBank = null } = {}) {
  const balances = { ip: Number(ipCash) || 0 };
  for (const [id, account] of Object.entries(bankAccounts || {})) balances[id] = Number(account?.balance) || 0;
  if (greyAccount) balances.grey = Number(greyAccount.balance) || 0;
  for (const [id, card] of Object.entries(muleCards || {})) balances[id] = Number(card?.balance) || 0;
  for (const [id, business] of Object.entries(fakeIps || {})) balances[id] = Number(business?.cash) || 0;
  if (ownedBank) balances.bank = Number(ownedBank.capital) || 0;
  return balances;
}

// One-time save adoption. Existing visible balances become the ledger's opening snapshot.
export function adoptLegacyBalances(worldCoreInput, balanceMap) {
  let ledger = ensureStage2Ledger(worldCoreInput.ledger, Object.keys(balanceMap || {}));
  for (const [legacyId, dollars] of Object.entries(balanceMap || {})) {
    const ledgerId = ledgerIdForLegacyAccount(legacyId);
    ledger = rebaseAccountCash(ledger, ledgerId, toCents(Math.max(0, Number(dollars) || 0)));
  }
  const audit = auditLedger(ledger);
  if (!audit.ok) throw new Error(`Stage 2 adoption failed ledger audit: ${audit.error}`);
  return {
    ...worldCoreInput,
    ledger,
    bridge: {
      ...(worldCoreInput.bridge || {}),
      phase: 2,
      authoritativeMoney: 'world-core-ledger',
      migratedSystems: ['player-payment-accounts', 'player-business-cash', 'transfers', 'taxes', 'fines', 'player-purchases'],
      notes: 'Stage 2: player-facing money routes through World Core. Unmigrated income/expense systems settle against a temporary legacy clearing account.',
      moneyVersion: STAGE2_MONEY_VERSION,
      adoptedAt: Date.now(),
      fallbackReconciliations: worldCoreInput.bridge?.fallbackReconciliations || 0
    }
  };
}

export function balanceForLegacyAccount(worldCore, legacyId) {
  const ledgerId = ledgerIdForLegacyAccount(legacyId);
  const account = worldCore?.ledger?.accounts?.[ledgerId];
  return account ? fromCents(account.cash) : 0;
}

function withAccounts(worldCoreInput, legacyIds = []) {
  return { ...worldCoreInput, ledger: ensureStage2Ledger(worldCoreInput.ledger, legacyIds) };
}

export function transferLegacyMoney(worldCoreInput, fromLegacyId, toLegacyId, amount, reason, { fee = 0, feeTo = MONEY_ACCOUNTS.services, meta = null } = {}) {
  const dollars = Math.max(0, Number(amount) || 0);
  const feeDollars = Math.max(0, Number(fee) || 0);
  if (dollars <= 0) return worldCoreInput;
  let core = withAccounts(worldCoreInput, [fromLegacyId, toLegacyId]);
  const from = ledgerIdForLegacyAccount(fromLegacyId);
  const to = ledgerIdForLegacyAccount(toLegacyId);
  const amountCents = toCents(dollars);
  const feeCents = toCents(feeDollars);
  if (feeCents > amountCents) throw new Error('Fee cannot exceed transfer amount');
  if (amountCents - feeCents > 0) core = { ...core, ledger: transfer(core.ledger, from, to, amountCents - feeCents, reason, meta) };
  if (feeCents > 0) {
    let ledger = cloneLedger(core.ledger);
    ensureAccount(ledger, feeTo, { name: 'Fee recipient', type: 'services' });
    core = { ...core, ledger: transfer(ledger, from, feeTo, feeCents, `${reason} · fee`, meta) };
  }
  return core;
}

export function payWorldCounterparty(worldCoreInput, fromLegacyId, amount, counterpartyId, reason, meta = null) {
  const dollars = Math.max(0, Number(amount) || 0);
  if (dollars <= 0) return worldCoreInput;
  let core = withAccounts(worldCoreInput, [fromLegacyId]);
  let ledger = cloneLedger(core.ledger);
  ensureAccount(ledger, counterpartyId, { name: counterpartyId, type: 'world-counterparty' });
  ledger = transfer(ledger, ledgerIdForLegacyAccount(fromLegacyId), counterpartyId, toCents(dollars), reason, meta);
  return { ...core, ledger };
}

export function receiveFromWorldCounterparty(worldCoreInput, toLegacyId, amount, counterpartyId, reason, meta = null) {
  const dollars = Math.max(0, Number(amount) || 0);
  if (dollars <= 0) return worldCoreInput;
  let core = withAccounts(worldCoreInput, [toLegacyId]);
  let ledger = cloneLedger(core.ledger);
  ensureAccount(ledger, counterpartyId, { name: counterpartyId, type: counterpartyId === MONEY_ACCOUNTS.clearing ? 'migration-bridge' : 'world-counterparty', allowNegative: counterpartyId === MONEY_ACCOUNTS.clearing });
  ledger = transfer(ledger, counterpartyId, ledgerIdForLegacyAccount(toLegacyId), toCents(dollars), reason, meta);
  return { ...core, ledger };
}

// Safety net while stages 3-5 are not migrated. If old code changes a visible balance,
// the exact opposite entry is posted to legacy clearing so the ledger still conserves cash.
export function reconcileLegacyDrift(worldCoreInput, balanceMap, reason = 'Legacy bridge reconciliation') {
  let core = withAccounts(worldCoreInput, Object.keys(balanceMap || {}));
  let ledger = core.ledger;
  let changed = false;
  let reconciled = 0;
  for (const [legacyId, rawDollars] of Object.entries(balanceMap || {})) {
    const id = ledgerIdForLegacyAccount(legacyId);
    const target = toCents(Math.max(0, Number(rawDollars) || 0));
    const current = ledger.accounts[id]?.cash || 0;
    const delta = target - current;
    if (!delta) continue;
    changed = true;
    reconciled += 1;
    if (delta > 0) ledger = transfer(ledger, MONEY_ACCOUNTS.clearing, id, delta, reason, { legacyId, direction: 'credit' });
    else ledger = transfer(ledger, id, MONEY_ACCOUNTS.clearing, -delta, reason, { legacyId, direction: 'debit' });
  }
  if (!changed) return worldCoreInput;
  const audit = auditLedger(ledger);
  if (!audit.ok) throw new Error(`Legacy reconciliation failed ledger audit: ${audit.error}`);
  return {
    ...core,
    ledger,
    bridge: {
      ...(core.bridge || {}),
      fallbackReconciliations: (core.bridge?.fallbackReconciliations || 0) + reconciled,
      lastFallbackAt: Date.now()
    }
  };
}
