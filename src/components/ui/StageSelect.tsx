import { useState, useRef, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { STAGES } from '../../types/contact';
import type { Stage } from '../../types/contact';
import {
  getStageTheme,
  getStoredStageColors,
  setStageColor,
  subscribeToStageColors,
  type NotionColumnColor
} from '../../utils/boardColors';
import { StageSettingsMenu } from './StageSettingsMenu';

interface StageSelectProps {
  value: Stage;
  onChange: (value: Stage) => void;
}

export function StageSelect({ value, onChange }: StageSelectProps) {
  const currentStage = value || 'Lead';
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [stageColors, setStageColors] = useState<Record<Stage, NotionColumnColor>>(() => getStoredStageColors());

  const containerRef = useRef<HTMLDivElement>(null);

  // Subscribe to global stage color updates
  useEffect(() => {
    return subscribeToStageColors((updated) => {
      setStageColors(updated);
    });
  }, []);

  // Sync highlighted index to currently selected stage when opening
  useEffect(() => {
    if (isOpen) {
      const idx = STAGES.indexOf(currentStage);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, currentStage]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      if (
        containerRef.current?.contains(target) ||
        target.closest('.stage-settings-popup') ||
        target.closest('[data-popup]')
      ) {
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

  const handleSelectStage = (stage: Stage) => {
    onChange(stage);
    setIsOpen(false);
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
      setHighlightedIndex((prev) =>
        prev < STAGES.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : STAGES.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const stage = STAGES[highlightedIndex];
      if (stage) {
        handleSelectStage(stage);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  const currentTheme = getStageTheme(currentStage);

  return (
    <div ref={containerRef} className="relative w-full" onKeyDown={handleKeyDown}>
      {/* Trigger Button */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between text-xs px-3 py-2 bg-white border border-[#d7d7d1] hover:border-[#b5b5ae] rounded-md text-[#2e2e2a] outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] transition-all cursor-pointer select-none"
      >
        <span
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border select-none transition-colors"
          style={{
            backgroundColor: currentTheme.pillBg,
            color: currentTheme.pillText,
            borderColor: currentTheme.swatchBorder
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: currentTheme.pillText }}
          />
          <span>{currentStage}</span>
        </span>
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
              Select Stage
            </span>
          </div>

          {/* Options List */}
          <div className="p-1">
            {STAGES.map((stage, index) => {
              const theme = getStageTheme(stage);
              const isSelected = stage === currentStage;
              const isHighlighted = index === highlightedIndex;
              const stageColor = stageColors[stage] || 'Default';

              return (
                <div
                  key={stage}
                  onClick={() => handleSelectStage(stage)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer select-none transition-colors ${
                    isHighlighted
                      ? 'bg-[#f7f7f5]'
                      : isSelected
                      ? 'bg-[#fbfbfa]'
                      : 'hover:bg-[#f7f7f5]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border select-none transition-colors"
                      style={{
                        backgroundColor: theme.pillBg,
                        color: theme.pillText,
                        borderColor: theme.swatchBorder
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: theme.pillText }}
                      />
                      <span>{stage}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#2383e2] stroke-[2.2] shrink-0" />
                    )}
                    <StageSettingsMenu
                      stageName={stage}
                      currentColor={stageColor}
                      onSelectColor={(color) => setStageColor(stage, color)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
