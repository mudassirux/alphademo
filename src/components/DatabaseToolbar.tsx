import { Select } from '@base-ui/react';
import {
  Table2,
  Columns3,
  Plus,
  Search,
  X,
  Filter,
  ChevronDown,
  ArrowDownUp,
  Check
} from 'lucide-react';
import { STAGES } from '../types/contact';
import type { Stage, ViewMode, SortOption } from '../types/contact';

interface DatabaseToolbarProps {
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  stageFilter: 'All stages' | Stage;
  onStageFilterChange: (stage: 'All stages' | Stage) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  onNewContact: () => void;
}

const STAGE_DOT_COLORS: Record<Stage, string> = {
  Lead: 'bg-[#989890]',
  Prospect: 'bg-[#c59c4f]',
  Qualified: 'bg-[#5e9b78]',
  Customer: 'bg-[#4378bf]'
};

export function DatabaseToolbar({
  activeView,
  onViewChange,
  searchQuery,
  onSearchChange,
  stageFilter,
  onStageFilterChange,
  sortBy,
  onSortChange,
  onNewContact
}: DatabaseToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-2.5 mb-1 pt-1 select-none flex-wrap">
      {/* Segmented Table / Board View Switch */}
      <div className="inline-flex items-center p-0.5 bg-[#f1f1ef] rounded-md border border-[#e4e4df] self-start sm:self-auto">
        <button
          type="button"
          onClick={() => onViewChange('table')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs transition-all cursor-pointer rounded ${
            activeView === 'table'
              ? 'bg-white text-[#2e2e2a] font-semibold shadow-xs'
              : 'text-[#787774] hover:text-[#2e2e2a] font-medium'
          }`}
          aria-pressed={activeView === 'table'}
        >
          <Table2 className="w-3.5 h-3.5" />
          <span>Table</span>
        </button>

        <button
          type="button"
          onClick={() => onViewChange('board')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs transition-all cursor-pointer rounded ${
            activeView === 'board'
              ? 'bg-white text-[#2e2e2a] font-semibold shadow-xs'
              : 'text-[#787774] hover:text-[#2e2e2a] font-medium'
          }`}
          aria-pressed={activeView === 'board'}
        >
          <Columns3 className="w-3.5 h-3.5" />
          <span>Board</span>
        </button>
      </div>

      {/* Toolbar Actions (Search, Filters, Sort, New, More) */}
      <div className="flex items-center justify-end gap-2 flex-wrap">
        {/* Search Input */}
        <div className="relative flex items-center border border-[#e4e4df] hover:border-[#d7d7d1] focus-within:border-[#2383e2] focus-within:ring-1 focus-within:ring-[#2383e2] rounded-md px-2.5 py-1.5 transition-all bg-white shadow-2xs group w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#9b9a97] shrink-0 mr-1.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, email, or company..."
            className="w-full bg-transparent text-xs text-[#2e2e2a] placeholder-[#9b9a97] outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="p-0.5 text-[#9b9a97] hover:text-[#2e2e2a] rounded cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Stage Filter Dropdown (Base UI) */}
        <Select.Root
          value={stageFilter}
          onValueChange={(val) => {
            if (val === 'All stages' || STAGES.includes(val as Stage)) {
              onStageFilterChange(val as 'All stages' | Stage);
            }
          }}
        >
          <Select.Trigger
            aria-label="Filter contacts by stage"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#55554e] bg-white hover:bg-[#f7f7f5] hover:text-[#2e2e2a] rounded-md border border-[#e4e4df] hover:border-[#d7d7d1] transition-all cursor-pointer outline-none shadow-2xs"
          >
            <Filter className="w-3.5 h-3.5 text-[#787774] shrink-0" />
            <span className="font-medium">
              {stageFilter === 'All stages' ? 'Stage' : stageFilter}
            </span>
            <Select.Icon>
              <ChevronDown className="w-3 h-3 text-[#9b9a97]" />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Positioner className="select-positioner" sideOffset={4} align="end">
              <Select.Popup className="select-popup w-44">
                <div className="text-[10px] font-bold text-[#9b9a97] uppercase tracking-wider px-2.5 py-1.5 border-b border-[#f1f1ee] mb-1">
                  Filter by Stage
                </div>
                <Select.List>
                  <Select.Item value="All stages" className="select-item">
                    <Select.ItemText>All stages</Select.ItemText>
                    <Select.ItemIndicator className="text-[#2383e2]">
                      <Check className="w-3.5 h-3.5" />
                    </Select.ItemIndicator>
                  </Select.Item>

                  {STAGES.map((stage) => (
                    <Select.Item key={stage} value={stage} className="select-item">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${STAGE_DOT_COLORS[stage]}`} />
                        <Select.ItemText>{stage}</Select.ItemText>
                      </div>
                      <Select.ItemIndicator className="text-[#2383e2]">
                        <Check className="w-3.5 h-3.5" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>

        {/* Sort Selector Dropdown (Base UI) */}
        <Select.Root
          value={sortBy}
          onValueChange={(val) => {
            if (val === 'Name' || val === 'Company' || val === 'Stage') {
              onSortChange(val as SortOption);
            }
          }}
        >
          <Select.Trigger
            aria-label="Sort contacts"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[#55554e] bg-white hover:bg-[#f7f7f5] hover:text-[#2e2e2a] rounded-md border border-[#e4e4df] hover:border-[#d7d7d1] transition-all cursor-pointer outline-none shadow-2xs"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-[#787774] shrink-0" />
            <span className="font-medium">{sortBy}</span>
            <Select.Icon>
              <ChevronDown className="w-3 h-3 text-[#9b9a97]" />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Positioner className="select-positioner" sideOffset={4} align="end">
              <Select.Popup className="select-popup w-40">
                <div className="text-[10px] font-bold text-[#9b9a97] uppercase tracking-wider px-2.5 py-1.5 border-b border-[#f1f1ee] mb-1">
                  Sort Contacts
                </div>
                <Select.List>
                  {(['Name', 'Company', 'Stage'] as const).map((option) => (
                    <Select.Item key={option} value={option} className="select-item">
                      <Select.ItemText>{option}</Select.ItemText>
                      <Select.ItemIndicator className="text-[#2383e2]">
                        <Check className="w-3.5 h-3.5" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.List>
              </Select.Popup>
            </Select.Positioner>
          </Select.Portal>
        </Select.Root>



        {/* + New Button */}
        <button
          type="button"
          onClick={onNewContact}
          className="inline-flex items-center gap-1 bg-[#2383e2] hover:bg-[#1b6fc2] text-white px-2.5 py-1.5 rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer ml-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New</span>
          <ChevronDown className="w-3 h-3 opacity-70 ml-0.5" />
        </button>
      </div>
    </div>
  );
}
