const DEFAULT_OWNERS = [
  'Priya Nair',
  'Arjun Rao',
  'Neha Kapoor',
  'Samira Khan',
  'Alex Rivera'
];

const STORAGE_KEY = 'alpha_crm_owners_v1';

let cachedOwners: string[] | null = null;
const listeners = new Set<(owners: string[]) => void>();

export function getStoredOwners(): string[] {
  if (cachedOwners) return cachedOwners;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedOwners = parsed;
        return cachedOwners;
      }
    }
  } catch {
    // Ignore localStorage parse errors
  }

  cachedOwners = [...DEFAULT_OWNERS];
  return cachedOwners;
}

export function addOwner(name: string): string {
  const trimmed = name.trim();
  if (!trimmed || trimmed.toLowerCase() === 'unassigned') {
    return trimmed;
  }

  const current = getStoredOwners();
  const exists = current.some((o) => o.toLowerCase() === trimmed.toLowerCase());
  if (exists) {
    return current.find((o) => o.toLowerCase() === trimmed.toLowerCase()) || trimmed;
  }

  const updated = [...current, trimmed];
  cachedOwners = updated;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage quota errors
  }

  listeners.forEach((listener) => listener(updated));
  return trimmed;
}

export function subscribeToOwners(listener: (owners: string[]) => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
