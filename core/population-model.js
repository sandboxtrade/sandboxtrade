// Aggregated population model. One million residents are NOT represented as one million
// JS objects. The world is kept in a small cohort matrix and only important NPCs will be
// materialized individually in later migration phases.

export const DEFAULT_POPULATION = 1_000_000;
export const POPULATION_MODEL_VERSION = 1;

const AGE_BANDS = [
  { id: '0-17', share: 0.18, working: false, mortality: 0.0004 },
  { id: '18-24', share: 0.08, working: true, mortality: 0.0007 },
  { id: '25-34', share: 0.16, working: true, mortality: 0.0010 },
  { id: '35-49', share: 0.20, working: true, mortality: 0.0018 },
  { id: '50-64', share: 0.20, working: true, mortality: 0.0050 },
  { id: '65+', share: 0.18, working: false, mortality: 0.0300 }
];

const INCOME_BANDS = [
  { id: 'low', share: 0.35, consume: 0.88, invest: 0.01, deposit: 0.18 },
  { id: 'middle', share: 0.45, consume: 0.72, invest: 0.06, deposit: 0.32 },
  { id: 'upper', share: 0.17, consume: 0.54, invest: 0.16, deposit: 0.42 },
  { id: 'wealthy', share: 0.03, consume: 0.32, invest: 0.35, deposit: 0.48 }
];

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function distributeInteger(total, weights) {
  const rows = weights.map((weight, index) => ({ index, raw: total * weight, value: Math.floor(total * weight) }));
  let left = total - rows.reduce((sum, row) => sum + row.value, 0);
  rows.sort((a, b) => (b.raw - b.value) - (a.raw - a.value));
  for (let i = 0; i < left; i += 1) rows[i % rows.length].value += 1;
  rows.sort((a, b) => a.index - b.index);
  return rows.map((row) => row.value);
}

function employmentRateFor(ageId, incomeId) {
  if (ageId === '0-17' || ageId === '65+') return 0;
  const byIncome = { low: 0.82, middle: 0.91, upper: 0.95, wealthy: 0.88 };
  const agePenalty = ageId === '18-24' ? 0.90 : ageId === '50-64' ? 0.95 : 1;
  return clamp((byIncome[incomeId] || 0.9) * agePenalty, 0, 1);
}

export function createPopulationModel(total = DEFAULT_POPULATION) {
  if (!Number.isSafeInteger(total) || total < 10_000) throw new Error('Population must be an integer of at least 10,000');
  const ageCounts = distributeInteger(total, AGE_BANDS.map((age) => age.share));
  const cohorts = [];
  AGE_BANDS.forEach((age, ageIndex) => {
    const incomeCounts = distributeInteger(ageCounts[ageIndex], INCOME_BANDS.map((income) => income.share));
    INCOME_BANDS.forEach((income, incomeIndex) => {
      const count = incomeCounts[incomeIndex];
      cohorts.push({
        id: `${age.id}:${income.id}`,
        age: age.id,
        income: income.id,
        workingAge: age.working,
        count,
        employed: age.working ? Math.round(count * employmentRateFor(age.id, income.id)) : 0,
        consumePropensity: income.consume,
        investPropensity: income.invest,
        depositPropensity: income.deposit,
        annualMortality: age.mortality
      });
    });
  });
  const model = {
    version: POPULATION_MODEL_VERSION,
    total,
    target: total,
    cohorts,
    annualRates: { birth: 0.010, migration: 0.002 },
    fractional: { births: 0, deaths: 0, migration: 0 },
    metrics: {},
    lastTickDay: 0
  };
  return recomputePopulationMetrics(model);
}

export function recomputePopulationMetrics(modelInput) {
  const model = { ...modelInput, cohorts: modelInput.cohorts.map((cohort) => ({ ...cohort })) };
  const total = model.cohorts.reduce((sum, cohort) => sum + cohort.count, 0);
  const workingAge = model.cohorts.reduce((sum, cohort) => sum + (cohort.workingAge ? cohort.count : 0), 0);
  const employed = model.cohorts.reduce((sum, cohort) => sum + cohort.employed, 0);
  const unemployed = Math.max(0, workingAge - employed);
  const consumptionWeight = model.cohorts.reduce((sum, cohort) => sum + cohort.count * cohort.consumePropensity, 0) / Math.max(1, total);
  const investmentWeight = model.cohorts.reduce((sum, cohort) => sum + cohort.count * cohort.investPropensity, 0) / Math.max(1, total);
  const depositWeight = model.cohorts.reduce((sum, cohort) => sum + cohort.count * cohort.depositPropensity, 0) / Math.max(1, total);
  model.total = total;
  model.metrics = {
    total,
    workingAge,
    employed,
    unemployed,
    unemploymentRate: workingAge ? unemployed / workingAge : 0,
    consumptionWeight,
    investmentWeight,
    depositWeight
  };
  return model;
}

function proportionalRemove(cohorts, totalToRemove) {
  if (totalToRemove <= 0) return cohorts.map((cohort) => ({ ...cohort }));
  const weighted = cohorts.map((cohort) => cohort.count * cohort.annualMortality);
  const weightTotal = weighted.reduce((sum, value) => sum + value, 0);
  let left = totalToRemove;
  const next = cohorts.map((cohort, index) => {
    const remove = weightTotal > 0 ? Math.min(cohort.count, Math.floor(totalToRemove * weighted[index] / weightTotal)) : 0;
    left -= remove;
    const ratio = cohort.count ? (cohort.count - remove) / cohort.count : 0;
    return { ...cohort, count: cohort.count - remove, employed: Math.min(cohort.count - remove, Math.round(cohort.employed * ratio)) };
  });
  for (let i = next.length - 1; left > 0 && i >= 0; i -= 1) {
    const remove = Math.min(left, next[i].count);
    if (remove > 0) {
      const old = next[i].count;
      next[i].count -= remove;
      next[i].employed = old ? Math.min(next[i].count, Math.round(next[i].employed * next[i].count / old)) : 0;
      left -= remove;
    }
  }
  return next;
}

export function tickPopulation(modelInput, { days = 1, laborDemandIndex = 1, migrationPressure = 1 } = {}) {
  if (!Number.isFinite(days) || days <= 0) return recomputePopulationMetrics(modelInput);
  let model = recomputePopulationMetrics(modelInput);
  const years = days / 365;
  const annualDeaths = model.cohorts.reduce((sum, cohort) => sum + cohort.count * cohort.annualMortality, 0);

  const birthRaw = model.total * model.annualRates.birth * years + (model.fractional.births || 0);
  const deathRaw = annualDeaths * years + (model.fractional.deaths || 0);
  const migrationRaw = model.total * model.annualRates.migration * clamp(migrationPressure, -2, 3) * years + (model.fractional.migration || 0);
  const births = Math.max(0, Math.floor(birthRaw));
  const deaths = Math.max(0, Math.floor(deathRaw));
  const migration = migrationRaw >= 0 ? Math.floor(migrationRaw) : Math.ceil(migrationRaw);

  let cohorts = proportionalRemove(model.cohorts, deaths);
  const childTargets = cohorts.filter((cohort) => cohort.age === '0-17');
  const childTotal = childTargets.reduce((sum, cohort) => sum + cohort.count, 0);
  let birthsLeft = births;
  childTargets.forEach((child, index) => {
    const add = index === childTargets.length - 1 ? birthsLeft : Math.floor(births * child.count / Math.max(1, childTotal));
    birthsLeft -= add;
    const target = cohorts.find((cohort) => cohort.id === child.id);
    target.count += add;
  });

  if (migration !== 0) {
    const working = cohorts.filter((cohort) => cohort.workingAge);
    const weights = working.map((cohort) => cohort.count);
    const totalWeight = weights.reduce((sum, value) => sum + value, 0);
    let left = migration;
    working.forEach((cohort, index) => {
      const delta = index === working.length - 1 ? left : Math.trunc(migration * weights[index] / Math.max(1, totalWeight));
      const target = cohorts.find((candidate) => candidate.id === cohort.id);
      const before = target.count;
      target.count = Math.max(0, target.count + delta);
      const actual = target.count - before;
      left -= actual;
    });
  }

  const laborFactor = clamp(laborDemandIndex, 0.65, 1.20);
  cohorts = cohorts.map((cohort) => {
    if (!cohort.workingAge) return { ...cohort, employed: 0 };
    const desiredRate = clamp(employmentRateFor(cohort.age, cohort.income) * laborFactor, 0.45, 0.985);
    const desired = Math.round(cohort.count * desiredRate);
    const maxMove = Math.max(1, Math.round(cohort.count * 0.0025 * days));
    const delta = clamp(desired - cohort.employed, -maxMove, maxMove);
    return { ...cohort, employed: clamp(cohort.employed + delta, 0, cohort.count) };
  });

  model = {
    ...model,
    cohorts,
    fractional: {
      births: birthRaw - births,
      deaths: deathRaw - deaths,
      migration: migrationRaw - migration
    },
    lastTickDay: (model.lastTickDay || 0) + days
  };
  return recomputePopulationMetrics(model);
}

export function validatePopulationModel(model) {
  if (!model || model.version !== POPULATION_MODEL_VERSION || !Array.isArray(model.cohorts)) throw new Error('Invalid population model');
  const normalized = recomputePopulationMetrics(model);
  if (normalized.total < 10_000 || normalized.total > 100_000_000) throw new Error('Population is outside supported range');
  for (const cohort of normalized.cohorts) {
    if (!Number.isSafeInteger(cohort.count) || cohort.count < 0) throw new Error('Invalid cohort count');
    if (!Number.isSafeInteger(cohort.employed) || cohort.employed < 0 || cohort.employed > cohort.count) throw new Error('Invalid employment count');
  }
  return normalized;
}
