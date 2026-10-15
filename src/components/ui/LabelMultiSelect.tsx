import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { X, Check, Plus } from 'lucide-react';
import { getLabelColor } from '../../types/contact';
import {
  getStoredLabels,
  subscribeToLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  type StoredLabel,
  type NotionLabelColor
} from '../../utils/labelStore';
import { LabelSettingsMenu } from './LabelSettingsMenu';

interface LabelMultiSelectProps {
  selectedLabels: string[];
  onChange: (labels: string[]) => void;
}

export function LabelMultiSelect({ selectedLabels, onChange }: LabelMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [labelsList, setLabelsList] = useState<StoredLabel[]>(() => getStoredLabels());
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to global label store updates
  useEffect(() => {
    return subscribeToLabels((updated) => {
      setLabelsList(updated);
    });
  }, []);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (
        containerRef.current?.contains(target) ||
        target.closest('.label-settings-popup') ||
        target.closest('[data-popup]')
      ) {
        return;
      }

      setIsOpen(false);
      setSearchQuery('');
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
    return () => {
      clearTimeout(timer);
    };
  }, [isOpen]);

  const handleToggleLabel = (labelName: string) => {
    if (selectedLabels.includes(labelName)) {
      onChange(selectedLabels.filter((l) => l !== labelName));
    } else {
      onChange([...selectedLabels, labelName]);
    }
  };

  const handleRemoveLabel = (labelName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedLabels.filter((l) => l !== labelName));
  };

  const handleCreateLabel = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const created = createLabel(trimmed);
    if (!selectedLabels.includes(created.name)) {
      onChange([...selectedLabels, created.name]);
    }
    setSearchQuery('');
  };

  const handleRenameLabel = (oldName: string, newName: string) => {
    updateLabel(oldName, { name: newName });
    if (selectedLabels.includes(oldName)) {
      onChange(selectedLabels.map((l) => (l === oldName ? newName : l)));
    }
  };

  const handleSelectColor = (labelName: string, color: NotionLabelColor) => {
    updateLabel(labelName, { color });
  };

  const handleDeleteLabel = (labelName: string) => {
    deleteLabel(labelName);
    if (selectedLabels.includes(labelName)) {
      onChange(selectedLabels.filter((l) => l !== labelName));
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const trimmed = searchQuery.trim();
      if (!trimmed) return;

      const exactMatch = labelsList.find(
        (l) => l.name.toLowerCase() === trimmed.toLowerCase()
      );

      if (exactMatch) {
        handleToggleLabel(exactMatch.name);
      } else {
        handleCreateLabel(trimmed);
      }
      setSearchQuery('');
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Filtered labels
  const query = searchQuery.trim().toLowerCase();
  const filteredLabels = labelsList.filter((l) =>
    l.name.toLowerCase().includes(query)
  );
  const hasExactMatch = labelsList.some(
    (l) => l.name.toLowerCase() === query
  );

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Selected Pills Display & Trigger Area */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }
        }}
        className="min-h-[38px] w-full p-1.5 bg-white border border-[#d7d7d1] hover:border-[#b5b5ae] rounded-md text-xs cursor-pointer flex flex-wrap items-center gap-1.5 focus-within:border-[#2383e2] focus-within:ring-1 focus-within:ring-[#2383e2] transition-all outline-none"
      >
        {selectedLabels.length === 0 ? (
          <span className="text-[#b5b5ae] px-1.5 select-none flex items-center gap-1">
            <Plus className="w-3.5 h-3.5 text-[#9b9a97]" />
            <span>Select or add labels...</span>
          </span>
        ) : (
          selectedLabels.map((label) => {
            const style = getLabelColor(label);
            return (
              <span
                key={label}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border transition-colors select-none"
                style={{
                  backgroundColor: style.bg,
                  color: style.text,
                  borderColor: style.border
                }}
              >
                <span>{label}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveLabel(label, e)}
                  aria-label={`Remove ${label}`}
                  className="hover:opacity-75 focus:outline-none p-0.5 cursor-pointer rounded-full"
                >
                  <X className="w-3 h-3 stroke-[2.5]" />
                </button>
              </span>
            );
          })
        )}

        {selectedLabels.length > 0 && (
          <span className="text-[#9b9a97] hover:text-[#55554e] p-0.5 ml-auto">
            <Plus className="w-3.5 h-3.5" />
          </span>
        )}
      </div>

      {/* Notion-Style Multi-Select Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-60 w-72 sm:w-80 bg-white border border-[#e4e4df] rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header Bar with Done button */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#f1f1ee] bg-[#fbfbfa]">
            <span className="text-[11px] font-semibold text-[#787774] uppercase tracking-wider">
              Labels
            </span>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                setSearchQuery('');
              }}
              className="px-2 py-0.5 text-xs font-semibold text-[#2383e2] hover:bg-[#edf5fd] rounded cursor-pointer transition-colors"
            >
              Done
            </button>
          </div>

          {/* Top Active Chips Bar (if labels selected) */}
          {selectedLabels.length > 0 && (
            <div className="p-2 border-b border-[#f1f1ee] bg-[#fbfbfa] flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
              {selectedLabels.map((label) => {
                const style = getLabelColor(label);
                return (
                  <span
                    key={label}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium border"
                    style={{
                      backgroundColor: style.bg,
                      color: style.text,
                      borderColor: style.border
                    }}
                  >
                    <span>{label}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveLabel(label, e)}
                      className="hover:opacity-70 cursor-pointer"
                    >
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Search / Create Input */}
          <div className="p-2 border-b border-[#f1f1ee] bg-white">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Select an option or create one"
              className="w-full text-xs px-2.5 py-1.5 bg-[#f7f7f5] hover:bg-[#f1f1ef] focus:bg-white border border-[#ebebe7] focus:border-[#2383e2] rounded-md outline-none text-[#2e2e2a] placeholder-[#9b9a97] transition-all"
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            <div className="text-[10px] font-semibold text-[#9b9a97] uppercase px-2.5 py-1.5 tracking-wider select-none">
              Select an option or create one
            </div>

            {filteredLabels.map((item) => {
              const isSelected = selectedLabels.includes(item.name);
              const style = getLabelColor(item.name);

              return (
                <div
                  key={item.id || item.name}
                  onClick={() => handleToggleLabel(item.name)}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer select-none transition-colors ${
                    isSelected ? 'bg-[#f7f7f5]' : 'hover:bg-[#f7f7f5]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-xs font-medium border truncate"
                      style={{
                        backgroundColor: style.bg,
                        color: style.text,
                        borderColor: style.border
                      }}
                    >
                      {item.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#2383e2] shrink-0" />
                    )}
                    <LabelSettingsMenu
                      labelName={item.name}
                      currentColor={item.color}
                      onRename={(newName) => handleRenameLabel(item.name, newName)}
                      onSelectColor={(color) => handleSelectColor(item.name, color)}
                      onDelete={() => handleDeleteLabel(item.name)}
                    />
                  </div>
                </div>
              );
            })}

            {/* Create option if typed text doesn't exist */}
            {query && !hasExactMatch && (
              <div
                onClick={() => handleCreateLabel(searchQuery)}
                className="flex items-center gap-2 px-2.5 py-2 mt-1 rounded-md text-xs text-[#2383e2] hover:bg-[#edf5fd] cursor-pointer select-none transition-colors border-t border-[#f1f1ee]"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  Create <strong className="font-semibold">"{searchQuery.trim()}"</strong>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
