import type { Stage } from '../types/contact';

const STAGE_CONFIG: Record<Stage, { bg: string; text: string; border: string; dot: string }> = {
  Lead: {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400'
  },
  Prospect: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500'
  },
  Qualified: {
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500'
  },
  Customer: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500'
  }
};

export function StageBadge({ stage }: { stage: Stage }) {
  const config = STAGE_CONFIG[stage] || STAGE_CONFIG.Lead;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{stage}</span>
    </span>
  );
}
