const LAPOSTE_RATES = [[0.5, 7.59], [1, 9.59], [2, 11.19], [5, 17.39], [10, 25.29], [15, 31.99], [30, 39.59]];

export function calculatePricing(weight, distance) {
  const numericWeight = Math.max(0, Number(weight) || 0);
  const laposte = LAPOSTE_RATES.find(([max]) => numericWeight <= max)?.[1] ?? 39.59;
  const rate = distance == null ? 0.75 : distance < 150 ? 0.7 : distance > 700 ? 0.8 : 0.75;
  const droovoPrice = Math.max(4.9, laposte * rate);
  const commission = droovoPrice * 0.22;
  const saving = laposte - droovoPrice;
  return { laposte: laposte.toFixed(2), poste: laposte.toFixed(2), droovoPrice: droovoPrice.toFixed(2), total: droovoPrice.toFixed(2), commission: commission.toFixed(2), driverGain: (droovoPrice - commission).toFixed(2), driver: (droovoPrice - commission).toFixed(2), saving: saving.toFixed(2), savingPercent: ((saving / laposte) * 100).toFixed(0) };
}
