// Unified money ledger for the merged Market Sandbox / STATE world.
// All authoritative money is stored as integer cents. Stage 2 keeps a temporary
// legacy-clearing account so still-unmigrated systems can be reconciled without
// silently creating or destroying money inside the migrated player-money layer.

export const CENT = 100;

export function toCents(value) {
  if (!Number.isFinite(value)) throw new Error('Money value must be finite');
  const cents = Math.round(value * CENT);
  if (!Number.isSafeInteger(cents)) throw new Error('Money value exceeds safe integer range');
  return cents;
}

export function fromCents(value) {
  assertCents(value, { allowNegative: true });
  return value / CENT;
}

export function assertCents(value, { allowNegative = false } = {}) {
  if (!Number.isSafeInteger(value)) throw new Error('Ledger amount must be an integer number of cents');
  if (!allowNegative && value < 0) throw new Error('Ledger amount cannot be negative');
  return value;
}

export function createLedger({ mode = 'shadow' } = {}) {
  return {
    version: 1,
    mode,
    tx: 0,
    openingTotal: 0,
    issuedTotal: 0,
    accounts: {},
    recent: []
  };
}

export function cloneLedger(ledger) {
  return {
    ...ledger,
    accounts: Object.fromEntries(Object.entries(ledger.accounts || {}).map(([id, account]) => [id, { ...account }])),
    recent: Array.isArray(ledger.recent) ? ledger.recent.map((tx) => ({ ...tx })) : []
  };
}

export function ensureAccount(ledger, id, { name = id, type = 'generic', opening = 0, allowNegative = false } = {}) {
  if (!id || typeof id !== 'string') throw new Error('Ledger account id is required');
  if (ledger.accounts[id]) {
    if (allowNegative && !ledger.accounts[id].allowNegative) ledger.accounts[id].allowNegative = true;
    return ledger.accounts[id];
  }
  assertCents(opening, { allowNegative });
  const account = { id, name, type, cash: opening, opening, issued: 0, inflow: 0, outflow: 0, allowNegative: !!allowNegative };
  ledger.accounts[id] = account;
  ledger.openingTotal += opening;
  return account;
}

function pushTransaction(ledger, record) {
  ledger.tx += 1;
  ledger.recent.unshift({ id: ledger.tx, ...record });
  if (ledger.recent.length > 300) ledger.recent.length = 300;
}

export function transfer(ledgerInput, from, to, cents, reason = 'Transfer', meta = null) {
  assertCents(cents);
  if (from === to) throw new Error('Sender and receiver must differ');
  const ledger = cloneLedger(ledgerInput);
  const source = ledger.accounts[from];
  const target = ledger.accounts[to];
  if (!source || !target) throw new Error('Unknown ledger account');
  if (!source.allowNegative && source.cash < cents) throw new Error(`Insufficient funds: ${source.name}`);
  if (cents === 0) return ledger;
  source.cash -= cents;
  source.outflow += cents;
  target.cash += cents;
  target.inflow += cents;
  pushTransaction(ledger, { from, to, cents, reason, meta, issued: false, at: Date.now() });
  return ledger;
}

export function issue(ledgerInput, to, cents, reason = 'Central bank issuance', meta = null) {
  assertCents(cents);
  const ledger = cloneLedger(ledgerInput);
  const target = ledger.accounts[to];
  if (!target) throw new Error('Unknown ledger account');
  target.cash += cents;
  target.issued += cents;
  target.inflow += cents;
  ledger.issuedTotal += cents;
  pushTransaction(ledger, { from: 'ISSUE', to, cents, reason, meta, issued: true, at: Date.now() });
  return ledger;
}

// Used only when adopting an existing legacy save into the ledger. Re-basing changes
// the opening snapshot, not runtime money. It must not be used for normal gameplay.
export function rebaseAccountCash(ledgerInput, id, cents) {
  assertCents(cents, { allowNegative: true });
  const ledger = cloneLedger(ledgerInput);
  const account = ledger.accounts[id];
  if (!account) throw new Error(`Unknown ledger account: ${id}`);
  const delta = cents - account.cash;
  account.cash = cents;
  account.opening += delta;
  ledger.openingTotal += delta;
  return ledger;
}

export function ledgerTotalCash(ledger) {
  return Object.values(ledger.accounts || {}).reduce((sum, account) => sum + assertCents(account.cash, { allowNegative: true }), 0);
}

export function auditLedger(ledger) {
  if (!ledger || ledger.version !== 1 || !ledger.accounts) throw new Error('Invalid ledger');
  const total = ledgerTotalCash(ledger);
  const expected = assertCents(ledger.openingTotal, { allowNegative: true }) + assertCents(ledger.issuedTotal);
  const error = total - expected;
  return { ok: error === 0, total, expected, error, accountCount: Object.keys(ledger.accounts).length, tx: ledger.tx || 0 };
}
