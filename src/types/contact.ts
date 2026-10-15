export const STAGES = ['Lead', 'Prospect', 'Qualified', 'Customer'] as const;
export type Stage = (typeof STAGES)[number];

export const OWNERS = [
  'Priya Nair',
  'Arjun Rao',
  'Neha Kapoor',
  'Samira Khan',
  'Alex Rivera',
  'Unassigned'
] as const;
export type Owner = (typeof OWNERS)[number];

export type ViewMode = 'table' | 'board';
export type SortOption = 'Name' | 'Company' | 'Stage';

export interface Contact {
  id: string;
  name: string;
  email: string;
  company: string;
  role: string;
  owner: string;
  labels: string[];
  stage: Stage;
  notes: string;
  avatarColor?: string;
}

export interface ContactDraft extends Omit<Contact, 'id'> {
  id?: string;
}

import { getLabelStyle } from '../utils/labelStore';

export interface LabelColor {
  name: string;
  bg: string;
  text: string;
  border: string;
}

export function getLabelColor(labelName: string): LabelColor {
  const style = getLabelStyle(labelName);
  return {
    name: style.name,
    bg: style.bg,
    text: style.text,
    border: style.border
  };
}
