export type NotionLabelColor =
  | 'Default'
  | 'Gray'
  | 'Brown'
  | 'Orange'
  | 'Yellow'
  | 'Green'
  | 'Blue'
  | 'Purple'
  | 'Pink'
  | 'Red';

export interface LabelColorTheme {
  name: NotionLabelColor;
  swatchBg: string;
  swatchBorder: string;
  bg: string;
  text: string;
  border: string;
}

export interface StoredLabel {
  id: string;
  name: string;
  color: NotionLabelColor;
}

export const NOTION_LABEL_COLORS: Record<NotionLabelColor, LabelColorTheme> = {
  Default: {
    name: 'Default',
    swatchBg: '#f1f1ef',
    swatchBorder: '#d7d7d1',
    bg: '#f1f1ef',
    text: '#37352f',
    border: '#e3e3de'
  },
  Gray: {
    name: 'Gray',
    swatchBg: '#ebebea',
    swatchBorder: '#d3d3d1',
    bg: '#f1f1ef',
    text: '#55554e',
    border: '#e3e3de'
  },
  Brown: {
    name: 'Brown',
    swatchBg: '#f4eeee',
    swatchBorder: '#e2d5d5',
    bg: '#f4eeee',
    text: '#64473a',
    border: '#e8dede'
  },
  Orange: {
    name: 'Orange',
    swatchBg: '#faecd5',
    swatchBorder: '#f3d9b4',
    bg: '#faecd5',
    text: '#8f4a14',
    border: '#f7dfbe'
  },
  Yellow: {
    name: 'Yellow',
    swatchBg: '#fdecc8',
    swatchBorder: '#fae0a2',
    bg: '#fdecc8',
    text: '#8f6416',
    border: '#fae0a2'
  },
  Green: {
    name: 'Green',
    swatchBg: '#dbeddb',
    swatchBorder: '#bee2be',
    bg: '#dbeddb',
    text: '#28593f',
    border: '#c3e2c3'
  },
  Blue: {
    name: 'Blue',
    swatchBg: '#d3e5ef',
    swatchBorder: '#b4d5e7',
    bg: '#d3e5ef',
    text: '#235a82',
    border: '#bdd7e7'
  },
  Purple: {
    name: 'Purple',
    swatchBg: '#e8deee',
    swatchBorder: '#d5c3df',
    bg: '#e8deee',
    text: '#5c3b77',
    border: '#d9c6e3'
  },
  Pink: {
    name: 'Pink',
    swatchBg: '#f5e0e9',
    swatchBorder: '#ecc4d5',
    bg: '#f5e0e9',
    text: '#7f3355',
    border: '#ecc4d5'
  },
  Red: {
    name: 'Red',
    swatchBg: '#fbe4e4',
    swatchBorder: '#f5c7c7',
    bg: '#ffe2dd',
    text: '#932c2c',
    border: '#f8c8c8'
  }
};

export const LABEL_COLOR_OPTIONS: NotionLabelColor[] = [
  'Default',
  'Gray',
  'Brown',
  'Orange',
  'Yellow',
  'Green',
  'Blue',
  'Purple',
  'Pink',
  'Red'
];

export const INITIAL_DEFAULT_LABELS: StoredLabel[] = [
  { id: 'l-1', name: 'Enterprise', color: 'Blue' },
  { id: 'l-2', name: 'Warm intro', color: 'Orange' },
  { id: 'l-3', name: 'SaaS', color: 'Purple' },
  { id: 'l-4', name: 'Partner', color: 'Green' },
  { id: 'l-5', name: 'High intent', color: 'Red' },
  { id: 'l-6', name: 'Product feedback', color: 'Yellow' },
  { id: 'l-7', name: 'Event follow-up', color: 'Pink' },
  { id: 'l-8', name: 'Renewal', color: 'Brown' }
];

const STORAGE_KEY = 'notion_directory_labels_v2';
const EVENT_NAME = 'notion-labels-updated';

export function getStoredLabels(): StoredLabel[] {
  if (typeof window === 'undefined') return [...INITIAL_DEFAULT_LABELS];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...INITIAL_DEFAULT_LABELS];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [...INITIAL_DEFAULT_LABELS];
  } catch {
    return [...INITIAL_DEFAULT_LABELS];
  }
}

export function saveStoredLabels(labels: StoredLabel[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(labels));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: labels }));
  } catch {
    // Ignore storage errors
  }
}

export function subscribeToLabels(callback: (labels: StoredLabel[]) => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<StoredLabel[]>).detail || getStoredLabels();
    callback(detail);
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
  };
}

export function createLabel(name: string, color?: NotionLabelColor): StoredLabel {
  const trimmed = name.trim();
  const current = getStoredLabels();
  const existing = current.find(
    (l) => l.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (existing) {
    return existing;
  }

  // Assign next color in cycle or fallback
  let assignedColor: NotionLabelColor = color ?? 'Default';
  if (!color) {
    const colorIndex = current.length % LABEL_COLOR_OPTIONS.length;
    assignedColor = LABEL_COLOR_OPTIONS[colorIndex];
  }

  const newLabel: StoredLabel = {
    id: `l-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: trimmed,
    color: assignedColor
  };

  const updated = [...current, newLabel];
  saveStoredLabels(updated);
  return newLabel;
}

export function updateLabel(
  oldName: string,
  updates: { name?: string; color?: NotionLabelColor }
) {
  const current = getStoredLabels();
  const updated = current.map((item) => {
    if (item.name.toLowerCase() === oldName.trim().toLowerCase()) {
      return {
        ...item,
        name: updates.name ? updates.name.trim() : item.name,
        color: updates.color ?? item.color
      };
    }
    return item;
  });
  saveStoredLabels(updated);
}

export function deleteLabel(name: string) {
  const current = getStoredLabels();
  const updated = current.filter(
    (item) => item.name.toLowerCase() !== name.trim().toLowerCase()
  );
  saveStoredLabels(updated);
}

export function getLabelStyle(labelName: string): {
  name: string;
  bg: string;
  text: string;
  border: string;
  colorName: NotionLabelColor;
} {
  const labels = getStoredLabels();
  const found = labels.find(
    (l) => l.name.toLowerCase() === labelName.trim().toLowerCase()
  );

  const colorName: NotionLabelColor = found ? found.color : 'Default';
  const theme = NOTION_LABEL_COLORS[colorName] || NOTION_LABEL_COLORS.Default;

  return {
    name: labelName,
    bg: theme.bg,
    text: theme.text,
    border: theme.border,
    colorName
  };
}
