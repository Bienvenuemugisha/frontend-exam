export function nextId(prefix, existingItems, idField = "id") {
  const max = existingItems.reduce((acc, item) => {
    const raw = String(item[idField] || "");
    const num = parseInt(raw.split("-")[1], 10);
    return Number.isFinite(num) && num > acc ? num : acc;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(4, "0")}`;
}
