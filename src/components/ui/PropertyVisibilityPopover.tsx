import { useState, useEffect, useMemo, useRef } from 'react';
import { Popover } from '@base-ui/react';
import {
  SlidersHorizontal,
  ArrowLeft,
  X,
  Search,
  GripVertical,
  Eye,
  EyeOff,
  AtSign,
  Briefcase,
  CircleDot,
  Building2,
  UserRound,
  Tags,
  FileText
} from 'lucide-react';
import { ALL_PROPERTIES } from '../../types/contact';
import type { PropertyId, ViewMode } from '../../types/contact';
import {
  getPropertyVisibility,
  toggleProperty,
  hideAllProperties,
  showAllProperties,
  reorderProperties,
  subscribeToProperties,
  type PropertyVisibilityState
} from '../../utils/propertyVisibilityStore';

interface PropertyVisibilityPopoverProps {
  activeView: ViewMode;
}

const PROPERTY_ICONS: Record<PropertyId, React.ComponentType<{ className?: string }>> = {
  name: () => <span className="font-semibold text-xs text-[#787774] leading-none select-none">Aa</span>,
  email: AtSign,
  role: Briefcase,
  stage: CircleDot,
  company: Building2,
  owner: UserRound,
  labels: Tags,
  notes: FileText
};

export function PropertyVisibilityPopover({ activeView }: PropertyVisibilityPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibilityState, setVisibilityState] = useState<PropertyVisibilityState>(getPropertyVisibility());
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Subscribe to changes
  useEffect(() => {
    return subscribeToProperties((nextState) => {
      setVisibilityState(nextState);
    });
  }, []);

  // Focus search input when popover opens
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      searchInputRef.current?.focus();
    }, 60);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setSearchQuery('');
    }
  };

  const query = searchQuery.trim().toLowerCase();

  // Filter shown & hidden lists based on search
  const filteredShown = useMemo(() => {
    return visibilityState.shown.filter((id) => {
      const meta = ALL_PROPERTIES.find((p) => p.id === id);
      if (!meta) return false;
      return meta.label.toLowerCase().includes(query);
    });
  }, [visibilityState.shown, query]);

  const filteredHidden = useMemo(() => {
    return visibilityState.hidden.filter((id) => {
      const meta = ALL_PROPERTIES.find((p) => p.id === id);
      if (!meta) return false;
      return meta.label.toLowerCase().includes(query);
    });
  }, [visibilityState.hidden, query]);

  // Drag and drop reordering for shown properties
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      reorderProperties(draggedIndex, targetIndex);
    }
    setDraggedIndex(null);
  };

  const viewLabel = activeView === 'table' ? 'table' : 'board';

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      {/* Notion Toolbar Trigger with Tooltip */}
      <div className="relative group">
        <Popover.Trigger
          type="button"
          aria-label="Show or hide properties"
          className={`flex items-center justify-center p-1.5 text-xs text-[#55554e] bg-white hover:bg-[#f7f7f5] hover:text-[#2e2e2a] rounded-md border border-[#e4e4df] hover:border-[#d7d7d1] transition-all cursor-pointer outline-none shadow-2xs ${
            isOpen ? 'bg-[#f0f0ed] text-[#2e2e2a] border-[#d7d7d1]' : ''
          }`}
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#787774]" />
        </Popover.Trigger>

        {/* Notion-style Dark Tooltip */}
        {!isOpen && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#1f1f1d] text-white text-[11px] font-medium rounded pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-md">
            Show or hide properties
          </div>
        )}
      </div>

      <Popover.Portal>
        <Popover.Positioner sideOffset={6} align="end" className="z-50">
          <Popover.Popup className="bg-white border border-[#ebebe7] rounded-lg shadow-xl w-72 max-w-[calc(100vw-24px)] outline-none animate-in fade-in-50 zoom-in-95 duration-100 flex flex-col text-left overflow-hidden">
            {/* Header: Back arrow, Title, Close button */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#f1f1ee]">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Back"
                  className="p-1 text-[#787774] hover:text-[#2e2e2a] hover:bg-[#f0f0ed] rounded transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <h3 className="text-xs font-semibold text-[#2e2e2a] tracking-tight">
                  Property visibility
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
                className="p-1 text-[#9b9a97] hover:text-[#2e2e2a] hover:bg-[#f0f0ed] rounded transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="p-2 border-b border-[#f1f1ee]">
              <div className="relative flex items-center bg-[#f7f7f5] rounded-md px-2.5 py-1 border border-transparent focus-within:border-[#2383e2] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#2383e2] transition-all">
                <Search className="w-3.5 h-3.5 text-[#9b9a97] shrink-0 mr-1.5" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for a property..."
                  className="w-full bg-transparent text-xs text-[#2e2e2a] placeholder-[#9b9a97] outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-0.5 text-[#9b9a97] hover:text-[#2e2e2a] rounded cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable Properties List */}
            <div className="max-h-80 overflow-y-auto custom-scrollbar p-1.5 space-y-3">
              {/* Section 1: Shown in table / board */}
              <div>
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[11px] font-medium text-[#787774]">
                    Shown in {viewLabel}
                  </span>
                  {filteredShown.some((id) => id !== 'name') && (
                    <button
                      type="button"
                      onClick={() => hideAllProperties()}
                      className="text-[11px] text-[#787774] hover:text-[#2e2e2a] hover:underline cursor-pointer"
                    >
                      Hide all
                    </button>
                  )}
                </div>

                <div className="space-y-0.5">
                  {filteredShown.map((id, index) => {
                    const meta = ALL_PROPERTIES.find((p) => p.id === id);
                    if (!meta) return null;
                    const Icon = PROPERTY_ICONS[id];
                    const isPrimary = meta.isPrimary;

                    return (
                      <div
                        key={id}
                        draggable={!isPrimary}
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index)}
                        className={`group flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#f1f1ee] transition-colors select-none ${
                          draggedIndex === index ? 'opacity-40 bg-[#f1f1ee]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {/* 6-dot grip handle */}
                          <span
                            className={`p-0.5 ${
                              isPrimary
                                ? 'opacity-20 cursor-default'
                                : 'cursor-grab text-[#b5b5ae] group-hover:text-[#787774]'
                            }`}
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </span>

                          {/* Property Type Icon */}
                          <div className="w-4 h-4 flex items-center justify-center shrink-0 text-[#787774]">
                            <Icon className="w-3.5 h-3.5 text-[#787774]" />
                          </div>

                          {/* Property Name */}
                          <span className="text-xs text-[#2e2e2a] font-normal truncate">
                            {meta.label}
                          </span>
                        </div>

                        {/* Visibility Toggle: Eye Icon */}
                        {isPrimary ? (
                          <span
                            title="Title property cannot be hidden"
                            className="p-1 text-[#b5b5ae] cursor-default opacity-50"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => toggleProperty(id)}
                            title={`Hide ${meta.label}`}
                            className="p-1 text-[#787774] hover:text-[#2e2e2a] hover:bg-black/5 rounded transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                  {filteredShown.length === 0 && (
                    <div className="px-2 py-1.5 text-xs text-[#9b9a97] italic">
                      No matching shown properties
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Hidden in table / board */}
              <div>
                <div className="flex items-center justify-between px-2 py-1">
                  <span className="text-[11px] font-medium text-[#787774]">
                    Hidden in {viewLabel}
                  </span>
                  {filteredHidden.length > 0 && (
                    <button
                      type="button"
                      onClick={() => showAllProperties()}
                      className="text-[11px] text-[#2383e2] hover:text-[#1b6fc2] hover:underline cursor-pointer font-medium"
                    >
                      Show all
                    </button>
                  )}
                </div>

                <div className="space-y-0.5">
                  {filteredHidden.map((id) => {
                    const meta = ALL_PROPERTIES.find((p) => p.id === id);
                    if (!meta) return null;
                    const Icon = PROPERTY_ICONS[id];

                    return (
                      <div
                        key={id}
                        className="group flex items-center justify-between px-2 py-1.5 rounded hover:bg-[#f1f1ee] transition-colors select-none"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {/* 6-dot grip handle */}
                          <span className="p-0.5 text-[#b5b5ae] group-hover:text-[#787774] cursor-default">
                            <GripVertical className="w-3.5 h-3.5" />
                          </span>

                          {/* Property Type Icon */}
                          <div className="w-4 h-4 flex items-center justify-center shrink-0 text-[#9b9a97]">
                            <Icon className="w-3.5 h-3.5 text-[#9b9a97]" />
                          </div>

                          {/* Property Name */}
                          <span className="text-xs text-[#787774] font-normal truncate">
                            {meta.label}
                          </span>
                        </div>

                        {/* Visibility Toggle: EyeOff Icon */}
                        <button
                          type="button"
                          onClick={() => toggleProperty(id)}
                          title={`Show ${meta.label}`}
                          className="p-1 text-[#9b9a97] hover:text-[#2e2e2a] hover:bg-black/5 rounded transition-colors cursor-pointer"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                  {filteredHidden.length === 0 && (
                    <div className="px-2 py-1 text-xs text-[#9b9a97] italic">
                      No hidden properties
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
