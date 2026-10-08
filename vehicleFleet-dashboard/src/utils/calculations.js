

export function round(num, digits = 2) {
  const factor = 10 ** digits;
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

export function fuelRecordCost(record) {
  return round((Number(record.litres) || 0) * (Number(record.pricePerLitre) || 0));
}

export function totalFuelCost(fuelRecords) {
  return round(fuelRecords.reduce((sum, r) => sum + (Number(r.totalCost) || 0), 0));
}

export function totalLitres(fuelRecords) {
  return round(fuelRecords.reduce((sum, r) => sum + (Number(r.litres) || 0), 0));
}

// Efficiency = distance travelled / litres consumed, using consecutive
// odometer readings for a vehicle's fuel records.
export function fuelEfficiencyByVehicle(fuelRecords, vehicleId) {
  const records = fuelRecords
    .filter((r) => r.vehicleId === vehicleId)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  if (records.length < 2) return null;
  let distance = 0;
  let litres = 0;
  for (let i = 1; i < records.length; i++) {
    const d = Number(records[i].odometer) - Number(records[i - 1].odometer);
    if (d > 0) {
      distance += d;
      litres += Number(records[i].litres) || 0;
    }
  }
  if (litres === 0) return null;
  return round(distance / litres);
}

export function totalMaintenanceCost(records) {
  return round(records.reduce((sum, r) => sum + (Number(r.cost) || 0), 0));
}

export function mileageDistance(record) {
  return Math.max(0, (Number(record.endMileage) || 0) - (Number(record.startMileage) || 0));
}

export function totalDistance(mileageRecords) {
  return mileageRecords.reduce((sum, r) => sum + mileageDistance(r), 0);
}

export function groupCount(items, key) {
  return items.reduce((acc, item) => {
    const k = item[key] || "Unknown";
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

export function sumByGroup(items, groupKey, valueFn) {
  return items.reduce((acc, item) => {
    const k = item[groupKey] || "Unknown";
    acc[k] = round((acc[k] || 0) + valueFn(item));
    return acc;
  }, {});
}

export function monthKey(dateStr) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(key) {
  if (key === "Unknown") return key;
  const [y, m] = key.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function seriesByMonth(items, dateField, valueFn, monthsBack = 6) {
  const now = new Date();
  const keys = [];
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  const totals = Object.fromEntries(keys.map((k) => [k, 0]));
  items.forEach((item) => {
    const k = monthKey(item[dateField]);
    if (k in totals) totals[k] = round(totals[k] + valueFn(item));
  });
  return keys.map((k) => ({ month: monthLabel(k), value: totals[k] }));
}

export function daysUntil(dateStr) {
  const target = new Date(dateStr);
  if (Number.isNaN(target.getTime())) return null;
  const diffMs = target.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}
