import { Table, Kanban } from 'lucide-react';
import type { ViewMode } from '../types/contact';

interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function ViewSwitcher({ currentView, onViewChange }: ViewSwitcherProps) {
  return (
    <div
      className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200/80 shadow-inner"
      role="group"
      aria-label="View switch controls"
    >
      <button
        type="button"
        id="view-toggle-table"
        aria-pressed={currentView === 'table'}
        onClick={() => onViewChange('table')}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer ${
          currentView === 'table'
            ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40 border border-transparent'
        }`}
      >
        <Table className="w-3.5 h-3.5" />
        <span>Table</span>
      </button>

      <button
        type="button"
        id="view-toggle-board"
        aria-pressed={currentView === 'board'}
        onClick={() => onViewChange('board')}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 cursor-pointer ${
          currentView === 'board'
            ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/40 border border-transparent'
        }`}
      >
        <Kanban className="w-3.5 h-3.5" />
        <span>Board</span>
      </button>
    </div>
  );
}
