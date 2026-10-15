import { X, Filter } from 'lucide-react';
import type { Stage } from '../types/contact';

interface SubtoolbarProps {
  totalCount: number;
  filteredCount: number;
  stageFilter: 'All stages' | Stage;
  onClearStageFilter: () => void;
  searchQuery: string;
}

export function Subtoolbar({
  totalCount,
  filteredCount,
  stageFilter,
  onClearStageFilter,
  searchQuery
}: SubtoolbarProps) {
  const isFiltered = stageFilter !== 'All stages' || Boolean(searchQuery.trim());
  if (!isFiltered) return null;

  return (
    <div className="flex items-center justify-between py-1.5 px-0.5 text-xs text-[#787774]">
      <div className="flex items-center gap-2 flex-wrap">
        {stageFilter !== 'All stages' && (
          <div className="inline-flex items-center gap-1.5 bg-[#edf5fd] text-[#2383e2] border border-[#d5e4f1] px-2 py-0.5 rounded-md font-medium text-xs">
            <Filter className="w-3 h-3" />
            <span>Stage is {stageFilter}</span>
            <button
              type="button"
              onClick={onClearStageFilter}
              className="hover:text-[#1b6fc2] ml-0.5 cursor-pointer"
              title="Clear stage filter"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {searchQuery.trim() && (
          <span className="text-[#8c8c85]">
            Matching "{searchQuery}"
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[11px] text-[#9b9a97]">
          {filteredCount} of {totalCount} {filteredCount === 1 ? 'record' : 'records'}
        </span>
      </div>
    </div>
  );
}
