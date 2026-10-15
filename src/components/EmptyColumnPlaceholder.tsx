import { UserCheck } from 'lucide-react';
import type { Stage } from '../types/contact';

export function EmptyColumnPlaceholder({ stage }: { stage: Stage }) {
  return (
    <div className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-dashed border-slate-200/90 bg-slate-50/50 text-center my-auto min-h-[180px]">
      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-2.5 shadow-2xs">
        <UserCheck className="w-5 h-5 text-slate-400" />
      </div>
      <p className="text-xs font-semibold text-slate-700 mb-1">
        No contacts in {stage}
      </p>
      <p className="text-[11px] text-slate-400 leading-relaxed max-w-[190px]">
        Update a contact's stage in the details panel to advance them here.
      </p>
    </div>
  );
}
