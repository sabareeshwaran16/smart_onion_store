/**
 * storageEngine.js
 * Pure calculation functions — no hardcoded UI, ready to be replaced by FastAPI responses.
 */

// ─── Weight Loss Model ────────────────────────────────────────────────────────
// Based on empirical onion storage research: ~0.3–0.5% weight loss per day
export function calcWeightAtDay(initialWeight, day, temp = 24, humidity = 65) {
  const baseLossRate = 0.0038; // 0.38% per day baseline
  const tempFactor   = temp > 28 ? 1 + (temp - 28) * 0.04 : temp < 18 ? 1.1 : 1.0;
  const humFactor    = humidity > 70 ? 1 + (humidity - 70) * 0.02 : humidity < 55 ? 1.05 : 1.0;
  const dailyRate    = baseLossRate * tempFactor * humFactor;
  return Math.max(0, +(initialWeight * Math.pow(1 - dailyRate, day)).toFixed(1));
}

// ─── Shelf Life Model ─────────────────────────────────────────────────────────
export function calcShelfLife(storageDays, temp = 24, humidity = 65, gasLevel = 300) {
  const baseLife = 90; // days total shelf life for good onions
  const tempPenalty = temp > 28 ? (temp - 28) * 1.5 : temp < 18 ? 5 : 0;
  const humPenalty  = humidity > 70 ? (humidity - 70) * 1.2 : 0;
  const gasPenalty  = gasLevel > 400 ? (gasLevel - 400) * 0.02 : 0;
  const remaining   = baseLife - storageDays - tempPenalty - humPenalty - gasPenalty;
  return Math.max(0, Math.round(remaining));
}

// ─── Risk Models ──────────────────────────────────────────────────────────────
export function calcRottingRisk(temp, humidity, storageDays) {
  let risk = 5;
  if (temp > 28) risk += (temp - 28) * 3;
  if (humidity > 70) risk += (humidity - 70) * 2.5;
  risk += storageDays * 0.3;
  return Math.min(100, Math.round(risk));
}

export function calcSproutingRisk(temp, humidity, storageDays) {
  let risk = 8;
  if (temp > 22) risk += (temp - 22) * 2;
  if (humidity > 65) risk += (humidity - 65) * 1.8;
  risk += storageDays * 0.4;
  return Math.min(100, Math.round(risk));
}

export function calcSpoilageRisk(temp, humidity, gasLevel, storageDays) {
  let risk = 6;
  if (temp > 26) risk += (temp - 26) * 2.5;
  if (humidity > 68) risk += (humidity - 68) * 2;
  if (gasLevel > 350) risk += (gasLevel - 350) * 0.03;
  risk += storageDays * 0.25;
  return Math.min(100, Math.round(risk));
}

// ─── Health Score ─────────────────────────────────────────────────────────────
export function calcHealthScore(temp, humidity, gasLevel, storageDays) {
  let score = 100;
  if (temp > 28) score -= (temp - 28) * 4;
  if (temp < 18) score -= (18 - temp) * 3;
  if (humidity > 70) score -= (humidity - 70) * 3;
  if (humidity < 55) score -= (55 - humidity) * 2;
  if (gasLevel > 400) score -= (gasLevel - 400) * 0.05;
  score -= storageDays * 0.3;
  return Math.max(0, Math.min(100, Math.round(score)));
}

// ─── Weight Loss Factor Breakdown ────────────────────────────────────────────
export function calcWeightLossFactors(temp, humidity, storageDays, weatherHumidity = 72) {
  const tempContrib     = temp > 26 ? 25 + (temp - 26) * 2 : 20;
  const humContrib      = humidity > 65 ? 20 + (humidity - 65) * 1.5 : 15;
  const weatherContrib  = weatherHumidity > 75 ? 10 + (weatherHumidity - 75) * 0.3 : 5;
  const durationContrib = Math.min(20, storageDays * 0.15);
  const moistureContrib = 100 - tempContrib - humContrib - weatherContrib - durationContrib;
  const total = moistureContrib + tempContrib + humContrib + durationContrib + weatherContrib;
  return [
    { factor: 'Moisture Evaporation', pct: Math.round((moistureContrib / total) * 100), color: '#2563eb' },
    { factor: 'Temperature Effect',   pct: Math.round((tempContrib / total) * 100),     color: '#ea580c' },
    { factor: 'Humidity Effect',       pct: Math.round((humContrib / total) * 100),      color: '#0891b2' },
    { factor: 'Storage Duration',      pct: Math.round((durationContrib / total) * 100), color: '#7c3aed' },
    { factor: 'Weather Influence',     pct: Math.round((weatherContrib / total) * 100),  color: '#f59e0b' },
  ];
}

// ─── Economics ────────────────────────────────────────────────────────────────
export function calcEconomics(initialWeight, finalWeight, pricePerKg, storageCost = 1200) {
  const revenue         = +(finalWeight * pricePerKg).toFixed(0);
  const baseRevenue     = +(initialWeight * (pricePerKg * 0.78)).toFixed(0); // price without smart storage
  const revenueLoss     = +(( initialWeight - finalWeight) * pricePerKg).toFixed(0);
  const moneySaved      = Math.max(0, revenue - baseRevenue);
  const netProfit       = revenue - storageCost;
  const roi             = +(((netProfit - baseRevenue) / storageCost) * 100).toFixed(1);
  const profitPct       = +(((netProfit - baseRevenue) / baseRevenue) * 100).toFixed(1);
  return { revenue, baseRevenue, revenueLoss, moneySaved, netProfit, roi, profitPct, storageCost };
}

// ─── Retrieval Simulation ─────────────────────────────────────────────────────
export function simulateRetrieval(params) {
  const { initialWeight, retrieveAfterDays, temp = 24, humidity = 65, gasLevel = 300, pricePerKg = 28 } = params;
  const weight       = calcWeightAtDay(initialWeight, retrieveAfterDays, temp, humidity);
  const shelfLife    = calcShelfLife(retrieveAfterDays, temp, humidity, gasLevel);
  const rottingRisk  = calcRottingRisk(temp, humidity, retrieveAfterDays);
  const sproutingRisk= calcSproutingRisk(temp, humidity, retrieveAfterDays);
  const spoilageRisk = calcSpoilageRisk(temp, humidity, gasLevel, retrieveAfterDays);
  const healthScore  = calcHealthScore(temp, humidity, gasLevel, retrieveAfterDays);
  const economics    = calcEconomics(initialWeight, weight, pricePerKg);
  const confidence   = Math.max(70, 95 - retrieveAfterDays * 0.1);
  return {
    retrieveAfterDays, weight, shelfLife, rottingRisk, sproutingRisk,
    spoilageRisk, healthScore, confidence: Math.round(confidence),
    revenueEstimate: economics.revenue,
    weightLoss: +(initialWeight - weight).toFixed(1),
    weightLossPct: +(((initialWeight - weight) / initialWeight) * 100).toFixed(1),
  };
}

// ─── Timeline Simulation ──────────────────────────────────────────────────────
export function generateTimeline(initialWeight, maxDays = 180, temp = 24, humidity = 65, gasLevel = 300) {
  return Array.from({ length: maxDays + 1 }, (_, day) => ({
    day,
    weight:        calcWeightAtDay(initialWeight, day, temp, humidity),
    shelfLife:     Math.max(0, calcShelfLife(day, temp, humidity, gasLevel)),
    rottingRisk:   calcRottingRisk(temp, humidity, day),
    sproutingRisk: calcSproutingRisk(temp, humidity, day),
    spoilageRisk:  calcSpoilageRisk(temp, humidity, gasLevel, day),
    healthScore:   calcHealthScore(temp, humidity, gasLevel, day),
  }));
}

// ─── AI Explanation Generator ─────────────────────────────────────────────────
export function generateExplanation(sensors, weatherImpact = null) {
  const { temperature: temp, humidity, gasLevel, storageDays } = sensors;
  const factors = [];

  if (temp > 28)
    factors.push(`Temperature at ${temp}°C exceeds safe limit of 28°C — accelerating moisture loss and spoilage.`);
  else if (temp < 20)
    factors.push(`Temperature at ${temp}°C is below optimal — may slow ripening but risks chilling injury.`);
  else
    factors.push(`Temperature ${temp}°C is within optimal 20–28°C range — favorable for storage.`);

  if (humidity > 70)
    factors.push(`Humidity at ${humidity}% exceeds 70% threshold — increasing sprouting and mold risk.`);
  else if (humidity < 55)
    factors.push(`Humidity at ${humidity}% is below 55% — accelerating moisture evaporation and weight loss.`);
  else
    factors.push(`Humidity ${humidity}% is within safe 55–70% range.`);

  if (gasLevel > 400)
    factors.push(`Gas level at ${gasLevel} ppm — elevated ethylene triggering early ripening and sprouting.`);
  else
    factors.push(`Gas level ${gasLevel} ppm — within acceptable range, minimal ethylene stress.`);

  if (storageDays > 60)
    factors.push(`Storage duration ${storageDays} days — cumulative stress significantly reducing shelf life.`);
  else if (storageDays > 30)
    factors.push(`Storage duration ${storageDays} days — moderate cumulative stress, monitor closely.`);

  if (weatherImpact && weatherImpact.outdoorHumidity > 78)
    factors.push(`Outdoor humidity forecast ${weatherImpact.outdoorHumidity}% — expected indoor humidity rise of 4–6% over next 48 hours.`);

  return factors;
}

// ─── Shelf Life Zone ──────────────────────────────────────────────────────────
export function getShelfLifeZone(days) {
  if (days >= 30) return { zone: 'Safe', color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', message: 'Safe to continue storage' };
  if (days >= 15) return { zone: 'Monitor', color: '#d97706', bg: '#fffbeb', border: '#fde68a', message: 'Monitor frequently — approaching warning zone' };
  if (days >= 7)  return { zone: 'Warning', color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', message: 'Prepare for retrieval — shelf life reducing fast' };
  return { zone: 'Critical', color: '#dc2626', bg: '#fef2f2', border: '#fecaca', message: 'Immediate sale recommended — critical shelf life' };
}
