export interface PastelColor {
  bg: string;
  text: string;
  border: string;
}

export const PASTEL_AVATAR_PALETTE: PastelColor[] = [
  // Soft Slate / Grey-Blue
  { bg: '#e8ecf2', text: '#475569', border: '#d8e0ea' },
  // Soft Lavender Tint
  { bg: '#ede9f6', text: '#5b507a', border: '#ded7ed' },
  // Soft Sky Blue
  { bg: '#e0ecfc', text: '#1e60c6', border: '#cbe0fb' },
  // Soft Ice Blue
  { bg: '#e6effc', text: '#2563eb', border: '#d4e5fb' },
  // Soft Ocean Mist
  { bg: '#dce9fd', text: '#1d5ec2', border: '#cadffb' },
  // Soft Periwinkle
  { bg: '#e6eaf8', text: '#3b4cb8', border: '#d3daf3' },
  // Soft Sage Tint
  { bg: '#e6f3ec', text: '#23734a', border: '#d0e7da' },
  // Soft Honey Tint
  { bg: '#fcf3e3', text: '#8c5716', border: '#f5e3c2' }
];

export function getPastelColor(name: string): PastelColor {
  if (!name || !name.trim()) {
    return PASTEL_AVATAR_PALETTE[0];
  }

  let hash = 0;
  const clean = name.trim().toLowerCase();
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }

  const index = Math.abs(hash) % PASTEL_AVATAR_PALETTE.length;
  return PASTEL_AVATAR_PALETTE[index];
}
