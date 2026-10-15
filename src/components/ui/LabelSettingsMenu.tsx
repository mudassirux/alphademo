import { useState, useRef, useEffect } from 'react';
import { Popover } from '@base-ui/react';
import { MoreHorizontal, Trash2, Check, Info } from 'lucide-react';
import {
  LABEL_COLOR_OPTIONS,
  NOTION_LABEL_COLORS,
  type NotionLabelColor
} from '../../utils/labelStore';

interface LabelSettingsMenuProps {
  labelName: string;
  currentColor: NotionLabelColor;
  onRename: (newName: string) => void;
  onSelectColor: (color: NotionLabelColor) => void;
  onDelete: () => void;
}

export function LabelSettingsMenu({
  labelName,
  currentColor,
  onRename,
  onSelectColor,
  onDelete
}: LabelSettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [prevPropName, setPrevPropName] = useState(labelName);
  const [nameValue, setNameValue] = useState(labelName);
  const inputRef = useRef<HTMLInputElement>(null);

  if (prevPropName !== labelName) {
    setPrevPropName(labelName);
    setNameValue(labelName);
  }

  // Focus and select input text when popover opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const commitRename = () => {
    const trimmed = nameValue.trim();
    if (trimmed && trimmed !== labelName) {
      onRename(trimmed);
    } else {
      setNameValue(labelName);
    }
  };

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger
        type="button"
        aria-label={`Options for ${labelName}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#ebebe7] rounded text-[#9b9a97] hover:text-[#55554e] transition-opacity cursor-pointer outline-none shrink-0"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="left" sideOffset={8} align="start" className="z-[90] outline-none">
          <Popover.Popup
            onClick={(e) => e.stopPropagation()}
            className="label-settings-popup bg-white border border-[#ebebe7] rounded-lg shadow-2xl p-1.5 w-56 outline-none animate-in fade-in-50 zoom-in-95 duration-100 z-[90]"
          >
            {/* Top Editable Label Name Input */}
            <div className="p-1 mb-1">
              <div className="relative flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      commitRename();
                      inputRef.current?.blur();
                    } else if (e.key === 'Escape') {
                      setNameValue(labelName);
                      setIsOpen(false);
                    }
                  }}
                  className="w-full text-xs font-medium pl-2.5 pr-7 py-1.5 bg-white border border-[#2383e2] rounded-md outline-none ring-1 ring-[#2383e2] text-[#2e2e2a]"
                />
                <div className="absolute right-2 text-[#9b9a97] pointer-events-none flex items-center">
                  <Info className="w-3.5 h-3.5 text-[#9b9a97]" />
                </div>
              </div>
            </div>

            {/* Delete Label Action */}
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDelete();
              }}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-[#2e2e2a] hover:bg-[#f1f1ee] rounded transition-colors cursor-pointer text-left"
            >
              <Trash2 className="w-4 h-4 text-[#787774] shrink-0" />
              <span>Delete</span>
            </button>

            {/* Divider */}
            <div className="my-1.5 h-px bg-[#ebebe7]" />

            {/* Colors Section Header */}
            <div className="px-2.5 py-1 text-[11px] font-medium text-[#787774] select-none">
              Colors
            </div>

            {/* Colors List */}
            <div className="flex flex-col gap-0.5 max-h-56 overflow-y-auto custom-scrollbar">
              {LABEL_COLOR_OPTIONS.map((colorKey) => {
                const theme = NOTION_LABEL_COLORS[colorKey];
                const isSelected = currentColor === colorKey;

                return (
                  <button
                    key={colorKey}
                    type="button"
                    onClick={() => {
                      onSelectColor(colorKey);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-[#2e2e2a] hover:bg-[#f1f1ee] rounded transition-colors cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-4 h-4 rounded-[3px] shrink-0 border"
                        style={{
                          backgroundColor: theme.swatchBg,
                          borderColor: theme.swatchBorder
                        }}
                      />
                      <span className="truncate">{colorKey}</span>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#2e2e2a] stroke-[2.2] shrink-0 ml-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
