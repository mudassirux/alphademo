import { ALL_PROPERTIES } from '../types/contact';
import type { PropertyId } from '../types/contact';

const STORAGE_KEY = 'contact_property_visibility_v3';
const EVENT_KEY = 'property_visibility_changed';

export interface PropertyVisibilityState {
  shown: PropertyId[];
  hidden: PropertyId[];
}

const DEFAULT_SHOWN: PropertyId[] = [
  'name',
  'email',
  'role',
  'stage',
  'company',
  'owner',
  'labels'
];

const DEFAULT_HIDDEN: PropertyId[] = [
  'notes'
];

function sanitizeState(parsed: Partial<PropertyVisibilityState>): PropertyVisibilityState {
  const allIds = ALL_PROPERTIES.map((p) => p.id);
  const shown = (parsed.shown || []).filter((id) => allIds.includes(id));
  const hidden = (parsed.hidden || []).filter((id) => allIds.includes(id) && !shown.includes(id));

  // Ensure 'name' (primary key) is always in shown
  if (!shown.includes('name')) {
    shown.unshift('name');
  }

  // Any property not in shown or hidden should be placed in its default location
  allIds.forEach((id) => {
    if (!shown.includes(id) && !hidden.includes(id)) {
      const meta = ALL_PROPERTIES.find((p) => p.id === id);
      if (meta?.defaultVisible) {
        shown.push(id);
      } else {
        hidden.push(id);
      }
    }
  });

  return { shown, hidden };
}

export function getPropertyVisibility(): PropertyVisibilityState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { shown: [...DEFAULT_SHOWN], hidden: [...DEFAULT_HIDDEN] };
    }
    const parsed = JSON.parse(raw);
    return sanitizeState(parsed);
  } catch {
    return { shown: [...DEFAULT_SHOWN], hidden: [...DEFAULT_HIDDEN] };
  }
}

function saveAndNotify(state: PropertyVisibilityState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore localStorage write failures
  }
  window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: state }));
}

export function toggleProperty(id: PropertyId) {
  if (id === 'name') return; // Primary property cannot be hidden
  const current = getPropertyVisibility();

  if (current.shown.includes(id)) {
    // Move to hidden
    const nextShown = current.shown.filter((p) => p !== id);
    const nextHidden = [...current.hidden, id];
    saveAndNotify({ shown: nextShown, hidden: nextHidden });
  } else {
    // Move to shown
    const nextHidden = current.hidden.filter((p) => p !== id);
    const nextShown = [...current.shown, id];
    saveAndNotify({ shown: nextShown, hidden: nextHidden });
  }
}

export function hideAllProperties() {
  const current = getPropertyVisibility();
  const nextShown: PropertyId[] = ['name'];
  const allOtherIds = ALL_PROPERTIES.filter((p) => p.id !== 'name').map((p) => p.id);
  // Keep relative order of other properties in hidden
  const nextHidden = Array.from(new Set([...current.hidden, ...allOtherIds]));
  saveAndNotify({ shown: nextShown, hidden: nextHidden });
}

export function showAllProperties() {
  const allIds = ALL_PROPERTIES.map((p) => p.id);
  saveAndNotify({ shown: allIds, hidden: [] });
}

export function reorderProperties(fromIndex: number, toIndex: number) {
  const current = getPropertyVisibility();
  const nextShown = [...current.shown];
  if (fromIndex < 0 || fromIndex >= nextShown.length || toIndex < 0 || toIndex >= nextShown.length) {
    return;
  }
  const [removed] = nextShown.splice(fromIndex, 1);
  nextShown.splice(toIndex, 0, removed);
  // Ensure 'name' is preserved at position 0
  if (nextShown[0] !== 'name') {
    const nameIdx = nextShown.indexOf('name');
    if (nameIdx > -1) {
      nextShown.splice(nameIdx, 1);
      nextShown.unshift('name');
    }
  }
  saveAndNotify({ shown: nextShown, hidden: current.hidden });
}

export function resetPropertyVisibility() {
  saveAndNotify({ shown: [...DEFAULT_SHOWN], hidden: [...DEFAULT_HIDDEN] });
}

export function subscribeToProperties(listener: (state: PropertyVisibilityState) => void): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<PropertyVisibilityState>;
    listener(customEvent.detail || getPropertyVisibility());
  };

  window.addEventListener(EVENT_KEY, handler);
  return () => window.removeEventListener(EVENT_KEY, handler);
}
