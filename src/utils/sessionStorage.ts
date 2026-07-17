export function repairSessionStorageString(key: string): void {
  const storedValue = window.sessionStorage.getItem(key);
  if (storedValue === null) return;

  try {
    if (typeof JSON.parse(storedValue) === "string") return;
  } catch {
    // Older checkout paths stored the address as plain text.
  }

  window.sessionStorage.setItem(key, JSON.stringify(storedValue));
}

export function writeSessionStorageString(key: string, value: string): void {
  window.sessionStorage.setItem(key, JSON.stringify(value));
}
