# Market Sandbox × STATE — v0.5 PLAYTEST CANDIDATE

This is the first build intended to be **played and tested**, not another feature milestone.

## Product rule
Market Sandbox remains the game: its navigation, cards, business-building progression and compact mobile-first UI stay primary. STATE-style logic is used underneath for conserved money, real counterparties, liabilities and population-driven demand.

## v0.5 changes
No new business systems were added.

Playtest blockers fixed:
- New Game now creates a completely fresh World Core instead of only resetting React/UI state.
- Starting cash is no longer an unexplained UI balance. It is a real treasury-funded starting endowment.
- Starting cash was tuned from $1,000 to **$2,000**, so the first $1,600 shop can be opened immediately and the player can start building a system instead of grinding work shifts first.
- Job wages and job bonuses are paid by the NPC-company sector.
- Training/course costs go to the services sector.
- Personal bank-loan issuance is funded by the NPC-bank sector and manual repayments return money to that sector.
- v0.4 bank/exchange/marketplace settlement remains active.

## Automated playtest gate
`tests/playtest-gate.test.mjs` covers a fresh vertical slice:

starting endowment → first shop cost → household-funded sales → own bank → exchange → marketplace → save/restore.

It verifies:
- ledger conservation;
- 1,000,000-resident cohort architecture;
- real counterparties for the tested route;
- marketplace GMV/revenue separation;
- save/load preservation of balances.

The longer Stage 4 stress test also runs **365 simulated days** with population + bank + exchange + marketplace active.

## Manual gate still required
The code can be considered a playtest candidate now, but the final product gate still requires an actual **30–60 minute phone/browser session**. Runtime UI testing could not be completed inside the build environment because the app currently imports React/Lucide from external CDNs and that environment has no DNS/network access.

If a real session exposes a progression blocker, save corruption, broken control or severe balance issue, we keep fixing v0.5 rather than starting v0.6.

## Versions
- Merge build: **v0.5 PLAYTEST CANDIDATE**
- Save schema: **v16**
- World Core: **v4**
- Finance Engine: **v1**
- Population: ~**1,000,000**, represented by 24 cohorts

## Tests
```bash
node tests/core-world.test.mjs
node tests/player-money.test.mjs
node tests/real-economy.test.mjs
node tests/stage3-business.test.mjs
node tests/finance-engine.test.mjs
node tests/stage4-vertical.test.mjs
node tests/playtest-gate.test.mjs
node --check app.js
```
