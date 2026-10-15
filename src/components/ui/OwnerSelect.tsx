import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { ChevronDown, Check, Search, UserRound, UserX, UserPlus } from 'lucide-react';
import { getStoredOwners, addOwner, subscribeToOwners } from '../../utils/ownerStore';

interface OwnerSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function OwnerSelect({ value, onChange }: OwnerSelectProps) {
  const currentOwner = value || 'Unassigned';
  const isUnassigned = !value || value === 'Unassigned';

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ownersList, setOwnersList] = useState<string[]>(() => getStoredOwners());
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Subscribe to owner store
  useEffect(() => {
    return subscribeToOwners((updated) => {
      setOwnersList(updated);
    });
  }, []);

  // Filter owners
  const query = searchQuery.trim().toLowerCase();
  const filteredOwners = ownersList.filter((owner) =>
    owner.toLowerCase().includes(query)
  );

  const hasExactMatch =
    query === 'unassigned' ||
    ownersList.some((o) => o.toLowerCase() === query);

  const showCreateOption = query.length > 0 && !hasExactMatch;

  // Total navigable items: [Unassigned, ...filteredOwners, (optional Create)]
  // Index 0: Unassigned
  // Index 1..N: filteredOwners
  // Index N+1: Create option (if present)
  const totalNavigable = 1 + filteredOwners.length + (showCreateOption ? 1 : 0);

  // Reset highlight on query change
  useEffect(() => {
    setHighlightedIndex(0);
  }, [searchQuery]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (containerRef.current?.contains(target)) {
        return;
      }
      setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectOwner = (owner: string) => {
    onChange(owner);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleCreateAndSelect = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const added = addOwner(trimmed);
    onChange(added);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < totalNavigable - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : totalNavigable - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex === 0) {
        handleSelectOwner('Unassigned');
      } else if (highlightedIndex <= filteredOwners.length) {
        const owner = filteredOwners[highlightedIndex - 1];
        if (owner) handleSelectOwner(owner);
      } else if (showCreateOption) {
        handleCreateAndSelect(searchQuery);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full" onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between text-xs px-3 py-2 bg-white border border-[#d7d7d1] hover:border-[#b5b5ae] rounded-md text-[#2e2e2a] outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] transition-all cursor-pointer select-none"
      >
        <div className="flex items-center gap-2 truncate">
          <span className="w-5 h-5 rounded-full bg-[#f1f1ee] border border-[#e4e4df] flex items-center justify-center text-[#55554e] shrink-0">
            {isUnassigned ? (
              <UserX className="w-3 h-3 text-[#9b9a97]" />
            ) : (
              <UserRound className="w-3 h-3 text-[#55554e]" />
            )}
          </span>
          <span className={`truncate ${isUnassigned ? 'text-[#9b9a97] italic' : 'text-[#2e2e2a] font-medium'}`}>
            {currentOwner}
          </span>
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#9b9a97] shrink-0 ml-1 transition-transform duration-150 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </div>

      {/* Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1 z-[70] w-full bg-white border border-[#e4e4df] rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Header */}
          <div className="px-3 py-2 border-b border-[#f1f1ee] bg-[#fbfbfa]">
            <span className="text-[10px] font-bold text-[#787774] uppercase tracking-wider">
              Select Owner
            </span>
          </div>

          {/* Search Filter Bar */}
          <div className="p-2 border-b border-[#f1f1ee] bg-white">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-[#9b9a97] absolute left-2.5 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search or add team member..."
                className="w-full text-xs pl-8 pr-2.5 py-1.5 bg-[#f7f7f5] hover:bg-[#f1f1ef] focus:bg-white border border-[#ebebe7] focus:border-[#2383e2] rounded-md outline-none text-[#2e2e2a] placeholder-[#9b9a97] transition-all"
              />
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-64 overflow-y-auto custom-scrollbar p-1">
            {/* Dedicated Unassigned Option */}
            <div
              onClick={() => handleSelectOwner('Unassigned')}
              onMouseEnter={() => setHighlightedIndex(0)}
              className={`flex items-center justify-between px-2.5 py-2 rounded-md text-xs cursor-pointer select-none transition-colors ${
                highlightedIndex === 0
                  ? 'bg-[#f7f7f5]'
                  : isUnassigned
                  ? 'bg-[#fbfbfa]'
                  : 'hover:bg-[#f7f7f5]'
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-5 h-5 rounded-full bg-[#f7f7f5] border border-[#e4e4df] flex items-center justify-center text-[#9b9a97] shrink-0">
                  <UserX className="w-3 h-3 text-[#9b9a97]" />
                </span>
                <span className="text-[#787774] font-medium">Unassigned</span>
              </div>
              {isUnassigned && (
                <Check className="w-3.5 h-3.5 text-[#2383e2] stroke-[2.2] shrink-0 ml-2" />
              )}
            </div>

            {/* Divider */}
            <div className="my-1 border-t border-[#f1f1ee]" />
            <div className="px-2.5 py-1 text-[10px] font-semibold text-[#9b9a97] uppercase tracking-wider select-none">
              Team Members
            </div>

            {/* Filtered Team Members */}
            {filteredOwners.length === 0 && !showCreateOption ? (
              <div className="px-3 py-3 text-center text-xs text-[#9b9a97]">
                No matching team members
              </div>
            ) : (
              filteredOwners.map((owner, idx) => {
                const itemIndex = idx + 1;
                const isSelected = owner === currentOwner;
                const isHighlighted = itemIndex === highlightedIndex;

                return (
                  <div
                    key={owner}
                    onClick={() => handleSelectOwner(owner)}
                    onMouseEnter={() => setHighlightedIndex(itemIndex)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer select-none transition-colors ${
                      isHighlighted
                        ? 'bg-[#f7f7f5]'
                        : isSelected
                        ? 'bg-[#fbfbfa]'
                        : 'hover:bg-[#f7f7f5]'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-[#f1f1ee] border border-[#e4e4df] flex items-center justify-center text-[#55554e] shrink-0">
                        <UserRound className="w-3 h-3 text-[#55554e]" />
                      </span>
                      <span className="truncate text-[#2e2e2a] font-medium">
                        {owner}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#2383e2] stroke-[2.2] shrink-0 ml-2" />
                    )}
                  </div>
                );
              })
            )}

            {/* Create option if typed text doesn't exist */}
            {showCreateOption && (
              <div
                onClick={() => handleCreateAndSelect(searchQuery)}
                onMouseEnter={() => setHighlightedIndex(totalNavigable - 1)}
                className={`flex items-center gap-2 px-2.5 py-2 mt-1 rounded-md text-xs text-[#2383e2] cursor-pointer select-none transition-colors border-t border-[#f1f1ee] ${
                  highlightedIndex === totalNavigable - 1
                    ? 'bg-[#edf5fd]'
                    : 'hover:bg-[#edf5fd]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">
                  Add <strong className="font-semibold">"{searchQuery.trim()}"</strong> as team member
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
