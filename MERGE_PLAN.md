# Market Sandbox × STATE — bounded merge plan

## Product rule
**Market Sandbox stays the game. STATE becomes the economic engine underneath it.**

We do not keep adding systems indefinitely before testing. The first hard product milestone is **v0.5 PLAYTEST**.

---

## v0.1 — World Core foundation — DONE
- Market Sandbox UI/game loop preserved.
- `core/world-core.js` added as the versioned economic root.
- Integer-cent conservation ledger added.
- Population starts at ~1,000,000 but is represented by 24 cohorts, not 1,000,000 JS objects.
- Population can grow far beyond one million without a 30–40k hard cap.
- Save migration introduced.

## v0.2 — Player money — DONE
- World Core ledger became authoritative for player-facing cash.
- Multiple Market Sandbox accounts were preserved rather than collapsing the UI into one wallet.
- ИП/ООО, cards, offshore, own-bank capital and secondary payment accounts moved into the same ledger.
- Transfers, fees, player taxes, fines and selected purchases became double-sided transactions.
- Transitional `bridge:legacy-clearing` retained only for systems not yet migrated.

## v0.3 — Population → business economy — DONE
Goal: make the first real economic loop work without changing the Market Sandbox feel.

Implemented:
- 1,000,000-resident cohort economy now generates a real consumer-demand factor.
- Demand reacts to population size, employment/unemployment, consumption propensity and the existing macro demand index.
- Resell-shop customer purchases are paid from the finite `world:households` account.
- Marketplace/retail fee on those sales goes to the NPC-company sector rather than disappearing.
- Factory B2B orders are paid from the finite NPC-company account.
- Factory order volume reacts to world demand.
- Warehouse ZZONE revenue is paid by the NPC-company sector into a separate ledger account for each warehouse.
- Warehouse withdrawals are real account-to-account transfers.
- Warehouse payroll transfers ИП cash back to households.
- Factory/warehouse/shop opening costs, supplier purchases, logistics, equipment, ads and customs use real counterparties where migrated.
- Aggregate background circulation added: NPC companies → wages → households → consumption / deposits → NPC banks → company funding.
- Existing warehouse payout balances are adopted once during save migration rather than minted again.
- Save schema is now v15; World Core is v3.

Still intentionally legacy in v0.3:
- player-owned bank internals;
- exchange price formation / full market cash circuit;
- own marketplace internal cash accounting;
- fund / corporate ownership layer;
- secondary systems such as rentals, tenders and some criminal flows.

---

# v0.4 — Close the primary vertical slice — DONE
**No new business types were added.** v0.4 closes the systems required for the first playable test.

### A. Own bank — DONE
- deposits are real household → bank cash flows and remain liabilities;
- deposit payouts return real bank cash to households;
- deposit liabilities cannot be withdrawn by the owner as profit;
- business/card/corporate loan issuance actually reduces bank cash;
- repayments return cash from the NPC-company sector;
- bank payroll, marketing, trader commissions, card fees and trading P/L use real counterparties;
- Market Sandbox bank tabs/controls were preserved instead of adding regulatory spreadsheets.

### B. Exchange — DONE for first playtest scope
- player buy/sell cash settles against a dedicated exchange liquidity account;
- liquidity is finite and can be replenished from the NPC-company sector;
- primary exchange settlement no longer uses `legacy-clearing`;
- Gaussian frame noise was reduced from a dominant driver to micro-noise;
- real player order flow creates a decaying directional impulse;
- existing Market Sandbox chart/trading UX was preserved.

### C. Own marketplace — DONE for first playtest scope
- GMV is household spending paid to sellers/NPC companies;
- marketplace receives only commission revenue;
- payroll/opex leave the marketplace's own ledger account;
- investor funding, owner payout, ads, hiring, growth spending, crisis costs and investor penalties use real counterparties;
- marketplace opening balance and old saves are adopted once.

### D. Primary-route clearing — DONE at the planned boundary
The normal v0.5 route — player account → shop/factory/warehouse → expansion → marketplace/bank/exchange — no longer needs `legacy-clearing` for its core revenue/settlement operations.

`legacy-clearing` still exists in secondary legacy features. Removing every occurrence is postponed until after the first playtest because it does not improve the v0.5 validation loop.

# v0.5 — PLAYTEST GATE — CANDIDATE READY
**This is the first build we call “играбельная для теста”.**

No new systems are added in v0.5. It is only balance, usability, compatibility, performance and bug fixing.

## Required playable loop
A fresh player must be able to:
1. start a new world with ~1,000,000 residents;
2. use personal accounts without money duplication;
3. open a shop and/or factory/warehouse;
4. buy stock/resources and receive demand-driven sales/orders;
5. pay wages, fees and taxes;
6. accumulate capital and expand the business chain;
7. use the own bank in its minimal real-money form;
8. trade on the exchange with working settlement;
9. reach/use the marketplace path without fake GMV/revenue accounting;
10. save, reload and continue with the same balances and businesses.

## v0.5 candidate status
Automated vertical-slice and long-run ledger tests pass. New-game reset, starting endowment and early job/loan cash paths were repaired before handoff.

**Remaining gate:** one real 30–60 minute manual play session on the target phone/browser. If that session finds a blocker, work remains on v0.5; v0.6 does not start yet.

## Hard acceptance checks for v0.5
- **30–60 minute manual session** without a progression-blocking bug.
- **Ledger error = 0** throughout automated economic stress tests.
- New save and v0.2–v0.4 migration tested.
- No primary-loop income appears from `legacy-clearing`.
- Population simulation remains cohort-based and does not allocate per-resident objects.
- UI remains recognizably Market Sandbox: compact, playable, no accounting-dashboard conversion.
- Main screens usable on phone without new dense tables/forms.
- No infinite loading, broken close buttons, dead primary actions or save corruption.

If these conditions are not met, version stays below v0.5 regardless of how many features exist.

---

# AFTER THE FIRST PLAYTEST — v0.6+
Only after feedback from v0.5:
- STATE-style fund / NAV / investor units;
- ownership, acquisitions, alliances, mergers;
- deeper government / finite tenders / state support;
- news and social generated from actual economic events;
- remaining secondary businesses connected to the ledger;
- Worker migration and major `app.js` decomposition;
- deeper balance and long-run economy tuning.

These are deliberately **not blockers for the first playable test**.
