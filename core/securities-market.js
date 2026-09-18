import { fromCents } from './money-ledger.js';
import { ensureStage4Finance, FINANCE_ACCOUNTS } from './finance-engine.js';

export const SECURITIES_MARKET_VERSION = 1;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function isEquitySecurity(company) {
  if (!company || company.isCommodity) return false;
  if (company.kind === 'crypto' || company.sector === 'Крипто') return false;
  return Number.isFinite(company.supply) && company.supply > 0;
}

function normalizedOwned(value, supply) {
  const n = Math.floor(Math.max(0, Number(value) || 0));
  return Math.min(Math.max(0, Math.floor(Number(supply) || 0)), n);
}

function normalizeHolderBuckets(totalShares, existing = null) {
  const total = Math.max(0, Math.floor(Number(totalShares) || 0));
  const raw = existing && typeof existing === 'object' ? existing : null;
  const rawHouseholds = Math.max(0, Number(raw?.households) || 0);
  const rawFunds = Math.max(0, Number(raw?.funds) || 0);
  const rawCompanies = Math.max(0, Number(raw?.companies) || 0);
  const rawTotal = rawHouseholds + rawFunds + rawCompanies;
  const householdRatio = rawTotal > 0 ? rawHouseholds / rawTotal : 0.55;
  const fundRatio = rawTotal > 0 ? rawFunds / rawTotal : 0.30;
  const households = Math.min(total, Math.floor(total * householdRatio));
  const funds = Math.min(total - households, Math.floor(total * fundRatio));
  const companies = total - households - funds;
  return { households, funds, companies };
}

function createBook(company, ownedQty = 0) {
  const supply = Math.max(1, Math.floor(Number(company.supply) || 1));
  const owned = normalizedOwned(ownedQty, supply);
  return {
    companyId: company.id,
    ticker: company.ticker,
    supply,
    npcShares: Math.max(0, supply - owned),
    holderBuckets: normalizeHolderBuckets(Math.max(0, supply - owned)),
    lastKnownPlayerQty: owned,
    turnover: 0,
    trades: 0,
    lastTradeAt: 0,
    lastSide: null,
    lastQty: 0,
    lastPrice: Number(company.price) || 0
  };
}

export function ensureSecurityBook(worldCoreInput, company, ownedQty = 0) {
  let core = ensureStage4Finance(worldCoreInput);
  if (!isEquitySecurity(company)) return { core, book: null };
  const securities = {
    version: SECURITIES_MARKET_VERSION,
    books: { ...(core.securities?.books || {}) }
  };
  const supply = Math.max(1, Math.floor(Number(company.supply) || 1));
  const owned = normalizedOwned(ownedQty, supply);
  const existing = securities.books[company.id];
  let book;
  if (!existing) {
    book = createBook(company, owned);
  } else {
    const oldSupply = Math.max(1, Math.floor(Number(existing.supply) || supply));
    let npcShares = Math.max(0, Math.floor(Number(existing.npcShares) || 0));
    const previousOwned = normalizedOwned(existing.lastKnownPlayerQty, oldSupply);
    const supplyDelta = supply - oldSupply;
    if (supplyDelta !== 0) npcShares += supplyDelta;
    const ownedDelta = owned - previousOwned;
    if (ownedDelta !== 0) npcShares -= ownedDelta;
    npcShares = clamp(Math.floor(npcShares), 0, Math.max(0, supply - owned));
    // Reconcile legacy or externally changed holdings to the conservation identity.
    // Every outstanding share is either in one of the player's visible accounts or
    // held by the aggregated rest of the market.
    if (npcShares + owned !== supply) npcShares = Math.max(0, supply - owned);
    book = {
      ...existing,
      companyId: company.id,
      ticker: company.ticker,
      supply,
      npcShares,
      holderBuckets: normalizeHolderBuckets(npcShares, existing.holderBuckets),
      lastKnownPlayerQty: owned,
      lastPrice: Number(existing.lastPrice) || Number(company.price) || 0
    };
  }
  securities.books[company.id] = book;
  core = { ...core, securities };
  return { core, book };
}

function marketDepth(company, { sentiment = 0, demandIndex = 1, side = 'buy' } = {}) {
  const supply = Math.max(1, Math.floor(Number(company.supply) || 1));
  const price = Math.max(0.000001, Number(company.price) || 0.000001);
  const cap = price * supply;
  const capFactor = clamp(Math.sqrt(cap / 250_000_000), 0.35, 2.6);
  const mood = clamp(1 + (Number(sentiment) || 0) / 180, 0.35, 1.55);
  const demand = clamp(Number(demandIndex) || 1, 0.55, 1.45);
  const sideFactor = side === 'buy' ? mood * demand : clamp((0.72 + mood * 0.28) * demand, 0.4, 1.45);
  return Math.max(10, Math.floor(supply * 0.0032 * capFactor * sideFactor));
}

export function quoteSecurityTrade(worldCoreInput, company, {
  side,
  qty,
  ownedQty = 0,
  sellableQty = ownedQty,
  sentiment = 0,
  demandIndex = 1
} = {}) {
  if (!isEquitySecurity(company)) throw new Error('Инструмент не является акцией');
  if (!['buy', 'sell'].includes(side)) throw new Error('Неизвестная сторона сделки');
  const requested = Math.floor(Number(qty) || 0);
  if (requested < 1) throw new Error('Количество должно быть не меньше 1');
  const prepared = ensureSecurityBook(worldCoreInput, company, ownedQty);
  const core = prepared.core;
  const book = prepared.book;
  const price0 = Math.max(0.000001, Number(company.price) || 0.000001);
  const supply = Math.max(1, book.supply);
  const depth = marketDepth(company, { sentiment, demandIndex, side });
  const scarcity = side === 'buy' ? 1 - book.npcShares / supply : clamp(ownedQty / supply, 0, 1);
  const cap = price0 * supply;
  const capFactor = clamp(Math.sqrt(cap / 250_000_000), 0.35, 2.6);
  const spread = clamp(0.0035 + 0.006 / capFactor + scarcity * 0.012, 0.0035, 0.035);
  const maxVisibleQty = Math.max(1, Math.floor(depth * 2.5));
  const impact = clamp(requested / Math.max(1, depth) * 0.026, 0, 0.22);
  const executionPrice = Math.max(0.000001, price0 * (side === 'buy' ? 1 + spread + impact / 2 : 1 - spread - impact / 2));
  const exchangeCash = fromCents(core.ledger.accounts[FINANCE_ACCOUNTS.exchange]?.cash || 0);
  const cashCapacity = side === 'sell' ? Math.max(0, Math.floor(exchangeCash / executionPrice)) : Number.MAX_SAFE_INTEGER;
  const structuralAvailable = side === 'buy' ? book.npcShares : Math.max(0, Math.floor(Number(sellableQty) || 0));
  const available = Math.max(0, Math.min(structuralAvailable, maxVisibleQty, cashCapacity));
  const fillQty = Math.min(requested, available);
  const total = executionPrice * fillQty;
  const lastPrice = Math.max(0.000001, price0 * (side === 'buy' ? 1 + impact : 1 - impact));
  return {
    core,
    book,
    side,
    requested,
    available,
    fillQty,
    price: executionPrice,
    total,
    lastPrice,
    spread,
    impact,
    impactPct: impact * 100,
    depth,
    maxVisibleQty,
    npcShares: book.npcShares,
    playerShares: book.lastKnownPlayerQty,
    supply,
    exchangeCash
  };
}

export function recordSecurityTrade(worldCoreInput, company, quote, {
  side,
  qty,
  ownedBefore = 0
} = {}) {
  const requested = Math.floor(Number(qty) || 0);
  if (!quote || requested < 1 || quote.available < requested) throw new Error('Недостаточно встречного объёма');
  const prepared = ensureSecurityBook(worldCoreInput, company, ownedBefore);
  const core = prepared.core;
  const book = { ...prepared.book };
  const nextOwned = side === 'buy' ? ownedBefore + requested : ownedBefore - requested;
  if (nextOwned < 0 || nextOwned > book.supply) throw new Error('Некорректный остаток акций');
  book.npcShares = side === 'buy' ? book.npcShares - requested : book.npcShares + requested;
  book.npcShares = clamp(Math.floor(book.npcShares), 0, book.supply);
  book.holderBuckets = normalizeHolderBuckets(book.npcShares, book.holderBuckets);
  book.lastKnownPlayerQty = Math.floor(nextOwned);
  book.turnover = (Number(book.turnover) || 0) + quote.price * requested;
  book.trades = (Number(book.trades) || 0) + 1;
  book.lastTradeAt = Date.now();
  book.lastSide = side;
  book.lastQty = requested;
  book.lastPrice = quote.lastPrice;
  if (book.npcShares + book.lastKnownPlayerQty !== book.supply) throw new Error('Нарушен баланс выпущенных акций');
  return {
    ...core,
    securities: {
      version: SECURITIES_MARKET_VERSION,
      books: { ...(core.securities?.books || {}), [company.id]: book }
    }
  };
}

export function securityMarketStats(worldCoreInput, companies = [], ownedByCompany = {}) {
  let core = ensureStage4Finance(worldCoreInput);
  let marketCap = 0;
  let npcShareValue = 0;
  let playerShareValue = 0;
  let householdShareValue = 0;
  let fundShareValue = 0;
  let companyShareValue = 0;
  let listed = 0;
  for (const company of companies) {
    if (!isEquitySecurity(company)) continue;
    const owned = Math.max(0, Number(ownedByCompany[company.id]) || 0);
    const prepared = ensureSecurityBook(core, company, owned);
    core = prepared.core;
    const book = prepared.book;
    const price = Math.max(0, Number(company.price) || 0);
    listed += 1;
    marketCap += price * book.supply;
    npcShareValue += price * book.npcShares;
    playerShareValue += price * book.lastKnownPlayerQty;
    householdShareValue += price * (book.holderBuckets?.households || 0);
    fundShareValue += price * (book.holderBuckets?.funds || 0);
    companyShareValue += price * (book.holderBuckets?.companies || 0);
  }
  return { core, listed, marketCap, npcShareValue, playerShareValue, householdShareValue, fundShareValue, companyShareValue };
}
