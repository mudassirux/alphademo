export function getInitials(name: string): string {
  if (!name || !name.trim()) return '?';
  const clean = name.trim().replace(/[^\w\s-]/g, '');
  if (!clean) return '?';

  const parts = clean.split(/[\s-]+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0][0].toUpperCase();
  }

  const first = parts[0][0];
  const last = parts[parts.length - 1][0];
  return (first + last).toUpperCase();
}
