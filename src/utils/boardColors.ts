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

/**
 * Fixed stage-to-color mapping. These are canonical colors and cannot be
 * changed by the user — each stage has a single authoritative Notion pastel.
 */
export const DEFAULT_STAGE_COLORS: Record<Stage, NotionColumnColor> = {
  Lead: 'Gray',
  Prospect: 'Yellow',
  Qualified: 'Green',
  Customer: 'Blue'
};

/**
 * Returns the color theme for a given stage.
 * Colors are fixed constants — no localStorage lookup required.
 */
export function getStageTheme(stage: Stage): ColumnColorTheme {
  const colorName = DEFAULT_STAGE_COLORS[stage] ?? 'Default';
  return NOTION_COLUMN_COLORS[colorName] ?? NOTION_COLUMN_COLORS.Default;
}
