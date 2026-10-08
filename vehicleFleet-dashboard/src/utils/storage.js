// Thin wrapper around localStorage with JSON + error handling.
const PREFIX = "fleet:";

export function loadFromStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Failed to load "${key}" from storage`, err);
    return fallback;
  }
}

export function saveToStorage(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error(`Failed to save "${key}" to storage`, err);
  }
}

export function clearAllFleetStorage() {
  Object.keys(window.localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => window.localStorage.removeItem(k));
}
