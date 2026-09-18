import { auditLedger, cloneLedger, ensureAccount, fromCents, rebaseAccountCash, toCents, transfer } from './money-ledger.js';
import { ECONOMY_ACCOUNTS, ensureRealEconomy } from './real-economy.js';
import { MONEY_ACCOUNTS, ensureStage2Ledger, ledgerIdForLegacyAccount } from './player-money.js';

export const FINANCE_ENGINE_VERSION = 1;
export const FINANCE_ACCOUNTS = {
  exchange: 'world:exchange-liquidity',
  marketFees: 'world:market-fees'
};

function transferUpTo(ledgerInput, from, to, requestedCents, reason, meta = null) {
  const requested = Math.max(0, requestedCents || 0);
  if (!requested) return { ledger: ledgerInput, paid: 0 };
  const available = Math.max(0, ledgerInput.accounts[from]?.cash || 0);
  const paid = Math.min(requested, available);
  if (!paid) return { ledger: ledgerInput, paid: 0 };
  return { ledger: transfer(ledgerInput, from, to, paid, reason, meta), paid };
}

function audit(core, label) {
  const result = auditLedger(core.ledger);
  if (!result.ok) throw new Error(`${label} ledger mismatch: ${result.error}`);
  return core;
}

export function ensureStage4Finance(worldCoreInput) {
  let core = ensureRealEconomy(worldCoreInput);
  let ledger = ensureStage2Ledger(core.ledger);
  ensureAccount(ledger, FINANCE_ACCOUNTS.exchange, { name: 'Exchange liquidity pool', type: 'exchange-liquidity' });
  ensureAccount(ledger, FINANCE_ACCOUNTS.marketFees, { name: 'Exchange fees', type: 'market-fees' });

  const seeded = core.finance?.version === FINANCE_ENGINE_VERSION && core.finance?.exchangeSeeded;
  if (!seeded) {
    const companiesCash = Math.max(0, ledger.accounts[ECONOMY_ACCOUNTS.companies]?.cash || 0);
    const seed = Math.min(companiesCash, Math.round(companiesCash * 0.12));
    if (seed > 0) ledger = transfer(ledger, ECONOMY_ACCOUNTS.companies, FINANCE_ACCOUNTS.exchange, seed, 'Seed exchange liquidity');
  }

  core = {
    ...core,
    ledger,
    finance: {
      ...(core.finance || {}),
      version: FINANCE_ENGINE_VERSION,
      exchangeSeeded: true,
      bankAdopted: !!core.finance?.bankAdopted,
      cumulative: {
        depositsIn: core.finance?.cumulative?.depositsIn || 0,
        depositsOut: core.finance?.cumulative?.depositsOut || 0,
        bankLoansIssued: core.finance?.cumulative?.bankLoansIssued || 0,
        bankRepayments: core.finance?.cumulative?.bankRepayments || 0,
        exchangeBuyVolume: core.finance?.cumulative?.exchangeBuyVolume || 0,
        exchangeSellVolume: core.finance?.cumulative?.exchangeSellVolume || 0
      }
    }
  };
  return audit(core, 'Stage 4 bootstrap');
}

export function adoptOwnedBankCash(worldCoreInput, bank) {
  let core = ensureStage4Finance(worldCoreInput);
  if (!bank || core.finance?.bankAdopted) return core;
  let ledger = cloneLedger(core.ledger);
  ensureAccount(ledger, MONEY_ACCOUNTS.ownedBank, { name: 'Player-owned bank cash', type: 'bank' });
  const visibleCash = Math.max(0,
    Number(bank.capital || 0) +
    Number(bank.depositReserve || 0) +
    Number(bank.creditPoolAllocated || 0) +
    Number(bank.cardCreditPoolAllocated || 0)
  );
  ledger = rebaseAccountCash(ledger, MONEY_ACCOUNTS.ownedBank, toCents(visibleCash));
  core = { ...core, ledger, finance: { ...core.finance, bankAdopted: true } };
  return audit(core, 'Bank adoption');
}

function bankFlow(worldCoreInput, from, to, requestedDollars, reason, meta = null) {
  let core = ensureStage4Finance(worldCoreInput);
  let ledger = cloneLedger(core.ledger);
  const result = transferUpTo(ledger, from, to, toCents(Math.max(0, Number(requestedDollars) || 0)), reason, meta);
  return { core: audit({ ...core, ledger: result.ledger }, reason), paidDollars: fromCents(result.paid) };
}

export function settleOwnedBankDepositInflow(worldCoreInput, requestedDollars, meta = null) {
  const result = bankFlow(worldCoreInput, ECONOMY_ACCOUNTS.households, MONEY_ACCOUNTS.ownedBank, requestedDollars, 'Household deposit into player bank', meta);
  return {
    ...result,
    core: { ...result.core, finance: { ...result.core.finance, cumulative: { ...result.core.finance.cumulative, depositsIn: result.core.finance.cumulative.depositsIn + result.paidDollars } } }
  };
}

export function settleOwnedBankDepositPayout(worldCoreInput, requestedDollars, meta = null) {
  const result = bankFlow(worldCoreInput, MONEY_ACCOUNTS.ownedBank, ECONOMY_ACCOUNTS.households, requestedDollars, 'Player bank deposit payout', meta);
  return {
    ...result,
    core: { ...result.core, finance: { ...result.core.finance, cumulative: { ...result.core.finance.cumulative, depositsOut: result.core.finance.cumulative.depositsOut + result.paidDollars } } }
  };
}

export function settleOwnedBankLoanIssue(worldCoreInput, requestedDollars, meta = null) {
  const result = bankFlow(worldCoreInput, MONEY_ACCOUNTS.ownedBank, ECONOMY_ACCOUNTS.companies, requestedDollars, 'Player bank loan issuance', meta);
  return {
    ...result,
    core: { ...result.core, finance: { ...result.core.finance, cumulative: { ...result.core.finance.cumulative, bankLoansIssued: result.core.finance.cumulative.bankLoansIssued + result.paidDollars } } }
  };
}

export function settleOwnedBankRepayment(worldCoreInput, requestedDollars, meta = null) {
  const result = bankFlow(worldCoreInput, ECONOMY_ACCOUNTS.companies, MONEY_ACCOUNTS.ownedBank, requestedDollars, 'Borrower repayment to player bank', meta);
  return {
    ...result,
    core: { ...result.core, finance: { ...result.core.finance, cumulative: { ...result.core.finance.cumulative, bankRepayments: result.core.finance.cumulative.bankRepayments + result.paidDollars } } }
  };
}

export function settleOwnedBankIncome(worldCoreInput, requestedDollars, source = ECONOMY_ACCOUNTS.companies, reason = 'Player bank income', meta = null) {
  return bankFlow(worldCoreInput, source, MONEY_ACCOUNTS.ownedBank, requestedDollars, reason, meta);
}

export function settleOwnedBankExpense(worldCoreInput, requestedDollars, recipient = ECONOMY_ACCOUNTS.services, reason = 'Player bank expense', meta = null) {
  return bankFlow(worldCoreInput, MONEY_ACCOUNTS.ownedBank, recipient, requestedDollars, reason, meta);
}

function ensureExchangeLiquidity(ledgerInput, requiredCents) {
  let ledger = cloneLedger(ledgerInput);
  const current = Math.max(0, ledger.accounts[FINANCE_ACCOUNTS.exchange]?.cash || 0);
  if (current >= requiredCents) return ledger;
  const shortfall = requiredCents - current;
  const sourceCash = Math.max(0, ledger.accounts[ECONOMY_ACCOUNTS.companies]?.cash || 0);
  const topUp = Math.min(shortfall, sourceCash);
  if (topUp > 0) ledger = transfer(ledger, ECONOMY_ACCOUNTS.companies, FINANCE_ACCOUNTS.exchange, topUp, 'Exchange liquidity replenishment');
  return ledger;
}

export function settleExchangeTrade(worldCoreInput, { legacyAccountId, side, cashDollars, reason = 'Exchange trade', meta = null } = {}) {
  let core = ensureStage4Finance(worldCoreInput);
  const accountId = ledgerIdForLegacyAccount(legacyAccountId);
  let ledger = ensureStage2Ledger(core.ledger, [legacyAccountId]);
  ensureAccount(ledger, accountId, { name: `Trading account ${legacyAccountId}`, type: 'player-account' });
  const cents = toCents(Math.max(0, Number(cashDollars) || 0));
  if (!cents) return { core, paidDollars: 0 };

  let result;
  if (side === 'buy') {
    const available = Math.max(0, ledger.accounts[accountId]?.cash || 0);
    result = available >= cents
      ? { ledger: transfer(ledger, accountId, FINANCE_ACCOUNTS.exchange, cents, reason, meta), paid: cents }
      : { ledger, paid: 0 };
  } else if (side === 'sell') {
    ledger = ensureExchangeLiquidity(ledger, cents);
    result = transferUpTo(ledger, FINANCE_ACCOUNTS.exchange, accountId, cents, reason, meta);
  } else {
    throw new Error('Unknown exchange side');
  }

  const paidDollars = fromCents(result.paid);
  core = {
    ...core,
    ledger: result.ledger,
    finance: {
      ...core.finance,
      cumulative: {
        ...core.finance.cumulative,
        exchangeBuyVolume: core.finance.cumulative.exchangeBuyVolume + (side === 'buy' ? paidDollars : 0),
        exchangeSellVolume: core.finance.cumulative.exchangeSellVolume + (side === 'sell' ? paidDollars : 0)
      }
    }
  };
  return { core: audit(core, 'Exchange settlement'), paidDollars };
}

export function financeAccountDollars(worldCoreInput, accountId) {
  const core = ensureStage4Finance(worldCoreInput);
  return fromCents(core.ledger.accounts[accountId]?.cash || 0);
}
