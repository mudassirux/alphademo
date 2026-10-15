import type { Stage } from '../types/contact';

export type NotionColumnColor =
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

export interface ColumnColorTheme {
  name: NotionColumnColor;
  swatchBg: string;
  swatchBorder: string;
  pillBg: string;
  pillText: string;
  colBg: string;
  colBorder: string;
}

export const NOTION_COLUMN_COLORS: Record<NotionColumnColor, ColumnColorTheme> = {
  Default: {
    name: 'Default',
    swatchBg: '#f1f1ef',
    swatchBorder: '#d7d7d1',
    pillBg: '#f1f1ef',
    pillText: '#37352f',
    colBg: '#fbfbfa',
    colBorder: '#ebebe7'
  },
  Gray: {
    name: 'Gray',
    swatchBg: '#ebebea',
    swatchBorder: '#d3d3d1',
    pillBg: '#f1f1ef',
    pillText: '#55554e',
    colBg: '#f7f7f5',
    colBorder: '#ebebe7'
  },
  Brown: {
    name: 'Brown',
    swatchBg: '#f4eeee',
    swatchBorder: '#e2d5d5',
    pillBg: '#f4eeee',
    pillText: '#64473a',
    colBg: '#faf7f5',
    colBorder: '#ede5e1'
  },
  Orange: {
    name: 'Orange',
    swatchBg: '#faecd5',
    swatchBorder: '#f3d9b4',
    pillBg: '#faecd5',
    pillText: '#8f4a14',
    colBg: '#fef9f3',
    colBorder: '#f6e5cf'
  },
  Yellow: {
    name: 'Yellow',
    swatchBg: '#fdecc8',
    swatchBorder: '#fae0a2',
    pillBg: '#fdecc8',
    pillText: '#8f6416',
    colBg: '#fefcf6',
    colBorder: '#faebd2'
  },
  Green: {
    name: 'Green',
    swatchBg: '#dbeddb',
    swatchBorder: '#bee2be',
    pillBg: '#dbeddb',
    pillText: '#28593f',
    colBg: '#f5faf6',
    colBorder: '#d8edd9'
  },
  Blue: {
    name: 'Blue',
    swatchBg: '#d3e5ef',
    swatchBorder: '#b4d5e7',
    pillBg: '#d3e5ef',
    pillText: '#235a82',
    colBg: '#f4f8fb',
    colBorder: '#d4e5f0'
  },
  Purple: {
    name: 'Purple',
    swatchBg: '#e8deee',
    swatchBorder: '#d5c3df',
    pillBg: '#e8deee',
    pillText: '#5c3b77',
    colBg: '#faf6fc',
    colBorder: '#ebe0f2'
  },
  Pink: {
    name: 'Pink',
    swatchBg: '#f5e0e9',
    swatchBorder: '#ecc4d5',
    pillBg: '#f5e0e9',
    pillText: '#7f3355',
    colBg: '#fcf6f8',
    colBorder: '#f5deea'
  },
  Red: {
    name: 'Red',
    swatchBg: '#fbe4e4',
    swatchBorder: '#f5c7c7',
    pillBg: '#fbe4e4',
    pillText: '#932c2c',
    colBg: '#fdf5f5',
    colBorder: '#fadcdc'
  }
};

export const COLOR_OPTIONS: NotionColumnColor[] = [
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

export const DEFAULT_STAGE_COLORS: Record<Stage, NotionColumnColor> = {
  Lead: 'Gray',
  Prospect: 'Yellow',
  Qualified: 'Green',
  Customer: 'Blue'
};

const STORAGE_KEY = 'notion_board_stage_colors_v2';
const EVENT_NAME = 'notion-stage-colors-changed';

export function getStoredStageColors(): Record<Stage, NotionColumnColor> {
  if (typeof window === 'undefined') return { ...DEFAULT_STAGE_COLORS };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STAGE_COLORS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_STAGE_COLORS, ...parsed };
  } catch {
    return { ...DEFAULT_STAGE_COLORS };
  }
}

export function saveStoredStageColors(colors: Record<Stage, NotionColumnColor>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: colors }));
  } catch {
    // Ignore storage errors
  }
}

export function subscribeToStageColors(
  callback: (colors: Record<Stage, NotionColumnColor>) => void
): () => void {
  if (typeof window === 'undefined') return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<Record<Stage, NotionColumnColor>>).detail || getStoredStageColors();
    callback(detail);
  };
  window.addEventListener(EVENT_NAME, handler);
  return () => {
    window.removeEventListener(EVENT_NAME, handler);
  };
}

export function getStageTheme(stage: Stage): ColumnColorTheme {
  const stageColors = getStoredStageColors();
  const colorName = stageColors[stage] || DEFAULT_STAGE_COLORS[stage] || 'Default';
  return NOTION_COLUMN_COLORS[colorName] || NOTION_COLUMN_COLORS.Default;
}
