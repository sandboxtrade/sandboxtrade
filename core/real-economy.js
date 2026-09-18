import { auditLedger, cloneLedger, ensureAccount, fromCents, rebaseAccountCash, toCents, transfer } from './money-ledger.js';

export const REAL_ECONOMY_VERSION = 1;
export const ECONOMY_ACCOUNTS = {
  households: 'world:households',
  companies: 'world:companies',
  banks: 'world:banks',
  treasury: 'world:treasury',
  services: 'world:payment-services'
};

const BASE_POPULATION = 1_000_000;
const AVG_MONTHLY_WAGE = 3_500;
const DAYS_PER_MONTH = 365 / 12;
const OPENING_CASH_PER_CAPITA = {
  households: 9_000,
  companies: 7_000,
  banks: 4_000,
  treasury: 2_500
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function accountDollars(ledger, id) {
  return fromCents(ledger.accounts[id]?.cash || 0);
}

function seedOpeningIfEmpty(ledgerInput, id, dollars) {
  let ledger = cloneLedger(ledgerInput);
  ensureAccount(ledger, id, { name: id, type: 'world-economy' });
  const account = ledger.accounts[id];
  if ((account.cash || 0) === 0 && (account.opening || 0) === 0 && dollars > 0) {
    ledger = rebaseAccountCash(ledger, id, toCents(dollars));
  }
  return ledger;
}

export function businessLedgerId(kind, id = 'main') {
  const safeKind = String(kind || 'business').replace(/[^a-z0-9_-]/gi, '-');
  const safeId = String(id || 'main').replace(/[^a-z0-9_-]/gi, '-');
  return `player:biz:${safeKind}:${safeId}`;
}

export function ensureBusinessAccount(worldCoreInput, kind, id, name = null) {
  const accountId = businessLedgerId(kind, id);
  const core = ensureRealEconomy(worldCoreInput);
  const ledger = cloneLedger(core.ledger);
  ensureAccount(ledger, accountId, { name: name || `${kind}:${id}`, type: `player-${kind}` });
  return { core: { ...core, ledger }, accountId };
}

export function ensureRealEconomy(worldCoreInput) {
  if (!worldCoreInput || typeof worldCoreInput !== 'object') throw new Error('World Core is required');
  let ledger = cloneLedger(worldCoreInput.ledger);
  ensureAccount(ledger, ECONOMY_ACCOUNTS.households, { name: 'Households aggregate', type: 'households' });
  ensureAccount(ledger, ECONOMY_ACCOUNTS.companies, { name: 'NPC companies aggregate', type: 'companies' });
  ensureAccount(ledger, ECONOMY_ACCOUNTS.banks, { name: 'NPC banks aggregate', type: 'banks' });
  ensureAccount(ledger, ECONOMY_ACCOUNTS.treasury, { name: 'Treasury', type: 'state' });
  ensureAccount(ledger, ECONOMY_ACCOUNTS.services, { name: 'Services aggregate', type: 'services' });

  const total = Math.max(10_000, Number(worldCoreInput.population?.total) || BASE_POPULATION);
  const alreadySeeded = worldCoreInput.economy?.version === REAL_ECONOMY_VERSION && worldCoreInput.economy?.openingSeeded;
  if (!alreadySeeded) {
    ledger = seedOpeningIfEmpty(ledger, ECONOMY_ACCOUNTS.households, total * OPENING_CASH_PER_CAPITA.households);
    ledger = seedOpeningIfEmpty(ledger, ECONOMY_ACCOUNTS.companies, total * OPENING_CASH_PER_CAPITA.companies);
    ledger = seedOpeningIfEmpty(ledger, ECONOMY_ACCOUNTS.banks, total * OPENING_CASH_PER_CAPITA.banks);
    ledger = seedOpeningIfEmpty(ledger, ECONOMY_ACCOUNTS.treasury, total * OPENING_CASH_PER_CAPITA.treasury);
  }

  const audit = auditLedger(ledger);
  if (!audit.ok) throw new Error(`Real economy bootstrap failed ledger audit: ${audit.error}`);
  return {
    ...worldCoreInput,
    ledger,
    economy: {
      ...(worldCoreInput.economy || {}),
      version: REAL_ECONOMY_VERSION,
      openingSeeded: true,
      avgMonthlyWage: worldCoreInput.economy?.avgMonthlyWage || AVG_MONTHLY_WAGE,
      lastDailyFlow: worldCoreInput.economy?.lastDailyFlow || null,
      cumulative: {
        householdConsumption: worldCoreInput.economy?.cumulative?.householdConsumption || 0,
        wages: worldCoreInput.economy?.cumulative?.wages || 0,
        playerRetailSales: worldCoreInput.economy?.cumulative?.playerRetailSales || 0,
        playerB2BRevenue: worldCoreInput.economy?.cumulative?.playerB2BRevenue || 0,
        marketplaceGmv: worldCoreInput.economy?.cumulative?.marketplaceGmv || 0,
        householdDeposits: worldCoreInput.economy?.cumulative?.householdDeposits || 0,
        bankFunding: worldCoreInput.economy?.cumulative?.bankFunding || 0
      }
    }
  };
}

export function worldDemandFactor(worldCoreInput, macroDemandIndex = 1) {
  const core = ensureRealEconomy(worldCoreInput);
  const p = core.population?.metrics || {};
  const populationScale = clamp((Number(p.total) || BASE_POPULATION) / BASE_POPULATION, 0.35, 4);
  const unemployment = clamp(Number(p.unemploymentRate) || 0.08, 0, 0.8);
  const employmentFactor = clamp(1.06 - Math.max(0, unemployment - 0.06) * 1.8, 0.55, 1.08);
  const propensityFactor = clamp((Number(p.consumptionWeight) || 0.7) / 0.7, 0.7, 1.25);
  const macro = clamp(Number(macroDemandIndex) || 1, 0.45, 1.45);
  return clamp(populationScale * employmentFactor * propensityFactor * macro, 0.2, 4.5);
}

function transferUpTo(ledgerInput, from, to, requestedCents, reason, meta = null) {
  const requested = Math.max(0, requestedCents || 0);
  if (!requested) return { ledger: ledgerInput, paid: 0 };
  const available = Math.max(0, ledgerInput.accounts[from]?.cash || 0);
  const paid = Math.min(requested, available);
  if (!paid) return { ledger: ledgerInput, paid: 0 };
  return { ledger: transfer(ledgerInput, from, to, paid, reason, meta), paid };
}

export function settleRetailSale(worldCoreInput, { grossDollars, feeRate = 0, destinationAccount = 'player:business', reason = 'Retail purchase', meta = null } = {}) {
  let core = ensureRealEconomy(worldCoreInput);
  let ledger = cloneLedger(core.ledger);
  ensureAccount(ledger, destinationAccount, { name: destinationAccount, type: 'player-business' });
  const requestedGross = Math.max(0, toCents(Math.max(0, Number(grossDollars) || 0)));
  const householdCash = Math.max(0, ledger.accounts[ECONOMY_ACCOUNTS.households].cash);
  const actualGross = Math.min(requestedGross, householdCash);
  if (!actualGross) return { core, grossDollars: 0, netDollars: 0, feeDollars: 0 };
  const fee = Math.min(actualGross, Math.round(actualGross * clamp(Number(feeRate) || 0, 0, 0.95)));
  const net = actualGross - fee;
  if (net > 0) ledger = transfer(ledger, ECONOMY_ACCOUNTS.households, destinationAccount, net, reason, meta);
  if (fee > 0) ledger = transfer(ledger, ECONOMY_ACCOUNTS.households, ECONOMY_ACCOUNTS.companies, fee, `${reason} · platform fee`, meta);
  const audit = auditLedger(ledger);
  if (!audit.ok) throw new Error(`Retail settlement ledger mismatch: ${audit.error}`);
  core = {
    ...core,
    ledger,
    economy: {
      ...core.economy,
      cumulative: {
        ...core.economy.cumulative,
        playerRetailSales: core.economy.cumulative.playerRetailSales + fromCents(actualGross)
      }
    }
  };
  return { core, grossDollars: fromCents(actualGross), netDollars: fromCents(net), feeDollars: fromCents(fee) };
}

export function settleB2BSale(worldCoreInput, { destinationAccount = 'player:business', requestedDollars, reason = 'B2B sale', meta = null } = {}) {
  let core = ensureRealEconomy(worldCoreInput);
  let ledger = cloneLedger(core.ledger);
  ensureAccount(ledger, destinationAccount, { name: destinationAccount, type: 'player-business' });
  const settled = transferUpTo(ledger, ECONOMY_ACCOUNTS.companies, destinationAccount, toCents(Math.max(0, Number(requestedDollars) || 0)), reason, meta);
  ledger = settled.ledger;
  const paidDollars = fromCents(settled.paid);
  core = {
    ...core,
    ledger,
    economy: {
      ...core.economy,
      cumulative: { ...core.economy.cumulative, playerB2BRevenue: core.economy.cumulative.playerB2BRevenue + paidDollars }
    }
  };
  return { core, paidDollars };
}

export function transferBusinessCash(worldCoreInput, { fromAccount, toAccount, amountDollars, reason = 'Business transfer', meta = null } = {}) {
  let core = ensureRealEconomy(worldCoreInput);
  let ledger = cloneLedger(core.ledger);
  ensureAccount(ledger, fromAccount, { name: fromAccount, type: 'player-business' });
  ensureAccount(ledger, toAccount, { name: toAccount, type: 'player-business' });
  const settled = transferUpTo(ledger, fromAccount, toAccount, toCents(Math.max(0, Number(amountDollars) || 0)), reason, meta);
  return { core: { ...core, ledger: settled.ledger }, paidDollars: fromCents(settled.paid) };
}

export function settleBusinessExpense(worldCoreInput, { fromAccount = 'player:business', requestedDollars, recipient = ECONOMY_ACCOUNTS.services, reason = 'Business expense', meta = null } = {}) {
  let core = ensureRealEconomy(worldCoreInput);
  let ledger = cloneLedger(core.ledger);
  ensureAccount(ledger, fromAccount, { name: fromAccount, type: 'player-business' });
  ensureAccount(ledger, recipient, { name: recipient, type: 'world-counterparty' });
  const settled = transferUpTo(ledger, fromAccount, recipient, toCents(Math.max(0, Number(requestedDollars) || 0)), reason, meta);
  return { core: { ...core, ledger: settled.ledger }, paidDollars: fromCents(settled.paid) };
}

export function settleMarketplacePulse(worldCoreInput, { marketplaceAccount, gmvDollars, revenueDollars, opexDollars, meta = null } = {}) {
  let core = ensureRealEconomy(worldCoreInput);
  let ledger = cloneLedger(core.ledger);
  ensureAccount(ledger, marketplaceAccount, { name: 'Player marketplace', type: 'player-marketplace' });

  const gmvRequested = toCents(Math.max(0, Number(gmvDollars) || 0));
  const buyerPayment = transferUpTo(ledger, ECONOMY_ACCOUNTS.households, ECONOMY_ACCOUNTS.companies, gmvRequested, 'Marketplace customer purchases', meta);
  ledger = buyerPayment.ledger;
  const gmvPaid = buyerPayment.paid;
  const gmvRatio = gmvRequested > 0 ? gmvPaid / gmvRequested : 0;

  const revenueRequested = toCents(Math.max(0, Number(revenueDollars) || 0) * gmvRatio);
  const commission = transferUpTo(ledger, ECONOMY_ACCOUNTS.companies, marketplaceAccount, revenueRequested, 'Marketplace commission', meta);
  ledger = commission.ledger;

  const opexRequested = toCents(Math.max(0, Number(opexDollars) || 0));
  const availableMarketplaceCash = Math.max(0, ledger.accounts[marketplaceAccount]?.cash || 0);
  const opexActual = Math.min(opexRequested, availableMarketplaceCash);
  const wagePart = Math.round(opexActual * 0.55);
  const servicePart = opexActual - wagePart;
  if (wagePart > 0) ledger = transfer(ledger, marketplaceAccount, ECONOMY_ACCOUNTS.households, wagePart, 'Marketplace payroll', meta);
  if (servicePart > 0) ledger = transfer(ledger, marketplaceAccount, ECONOMY_ACCOUNTS.services, servicePart, 'Marketplace operating expenses', meta);

  const gmv = fromCents(gmvPaid);
  const revenue = fromCents(commission.paid);
  const opex = fromCents(opexActual);
  core = {
    ...core,
    ledger,
    economy: {
      ...core.economy,
      cumulative: { ...core.economy.cumulative, marketplaceGmv: core.economy.cumulative.marketplaceGmv + gmv }
    }
  };
  return { core, gmvDollars: gmv, revenueDollars: revenue, opexDollars: opex, netDollars: revenue - opex, cashDollars: accountDollars(ledger, marketplaceAccount) };
}

export function tickAggregateEconomyDay(worldCoreInput, { demandIndex = 1 } = {}) {
  let core = ensureRealEconomy(worldCoreInput);
  let ledger = cloneLedger(core.ledger);
  const metrics = core.population?.metrics || {};
  const employed = Math.max(0, Number(metrics.employed) || 0);
  const consumptionWeight = clamp(Number(metrics.consumptionWeight) || 0.7, 0.2, 0.95);
  const dailyWagesRequested = toCents(employed * (core.economy.avgMonthlyWage || AVG_MONTHLY_WAGE) / DAYS_PER_MONTH);
  const wages = transferUpTo(ledger, ECONOMY_ACCOUNTS.companies, ECONOMY_ACCOUNTS.households, dailyWagesRequested, 'Aggregate payroll');
  ledger = wages.ledger;

  const consumptionRequested = Math.round(wages.paid * consumptionWeight * clamp(Number(demandIndex) || 1, 0.5, 1.4));
  const consumption = transferUpTo(ledger, ECONOMY_ACCOUNTS.households, ECONOMY_ACCOUNTS.companies, consumptionRequested, 'Aggregate household consumption');
  ledger = consumption.ledger;

  // The unspent part of wages does not disappear from the productive economy: most
  // of it reaches NPC banks as deposits and is recycled into NPC-company funding.
  // Deposit liabilities themselves are introduced in the v0.4 banking migration;
  // here we only preserve the aggregate cash circuit so a long simulation cannot
  // drain all companies merely because households save.
  const unspentWages = Math.max(0, wages.paid - consumption.paid);
  const depositRequested = Math.round(unspentWages * 0.95);
  const deposits = transferUpTo(ledger, ECONOMY_ACCOUNTS.households, ECONOMY_ACCOUNTS.banks, depositRequested, 'Aggregate household deposits');
  ledger = deposits.ledger;
  const fundingRequested = Math.round(deposits.paid * 0.90);
  const funding = transferUpTo(ledger, ECONOMY_ACCOUNTS.banks, ECONOMY_ACCOUNTS.companies, fundingRequested, 'Aggregate bank funding');
  ledger = funding.ledger;

  const audit = auditLedger(ledger);
  if (!audit.ok) throw new Error(`Aggregate economy ledger mismatch: ${audit.error}`);
  const wageDollars = fromCents(wages.paid);
  const consumptionDollars = fromCents(consumption.paid);
  return {
    ...core,
    ledger,
    economy: {
      ...core.economy,
      lastDailyFlow: { day: core.time?.day || 0, wages: wageDollars, consumption: consumptionDollars, deposits: fromCents(deposits.paid), bankFunding: fromCents(funding.paid) },
      cumulative: {
        ...core.economy.cumulative,
        wages: core.economy.cumulative.wages + wageDollars,
        householdConsumption: core.economy.cumulative.householdConsumption + consumptionDollars,
        householdDeposits: core.economy.cumulative.householdDeposits + fromCents(deposits.paid),
        bankFunding: core.economy.cumulative.bankFunding + fromCents(funding.paid)
      }
    }
  };
}

export function economyAccountBalance(worldCoreInput, accountId) {
  const core = ensureRealEconomy(worldCoreInput);
  return accountDollars(core.ledger, accountId);
}

export function adoptBusinessOpeningBalance(worldCoreInput, { kind, id, dollars, name = null } = {}) {
  let core = ensureRealEconomy(worldCoreInput);
  const key = `${String(kind)}:${String(id)}`;
  if (core.economy?.businessAdoptions?.[key]) return core;
  const accountId = businessLedgerId(kind, id);
  let ledger = cloneLedger(core.ledger);
  ensureAccount(ledger, accountId, { name: name || key, type: `player-${kind}` });
  if ((ledger.accounts[accountId]?.cash || 0) === 0 && Number(dollars) > 0) {
    ledger = rebaseAccountCash(ledger, accountId, toCents(Math.max(0, Number(dollars) || 0)));
  }
  return {
    ...core,
    ledger,
    economy: {
      ...core.economy,
      businessAdoptions: { ...(core.economy?.businessAdoptions || {}), [key]: true }
    }
  };
}
