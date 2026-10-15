import { useState } from 'react';
import { Popover } from '@base-ui/react';
import { MoreHorizontal, Check, Palette } from 'lucide-react';
import {
  COLOR_OPTIONS,
  NOTION_COLUMN_COLORS,
  type NotionColumnColor
} from '../../utils/boardColors';

interface StageSettingsMenuProps {
  stageName: string;
  currentColor: NotionColumnColor;
  onSelectColor: (color: NotionColumnColor) => void;
}

export function StageSettingsMenu({
  stageName,
  currentColor,
  onSelectColor
}: StageSettingsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger
        type="button"
        aria-label={`Color options for ${stageName}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[#ebebe7] rounded text-[#9b9a97] hover:text-[#55554e] transition-opacity cursor-pointer outline-none shrink-0"
      >
        <MoreHorizontal className="w-3.5 h-3.5" />
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner side="left" sideOffset={8} align="start" className="z-[90] outline-none">
          <Popover.Popup
            onClick={(e) => e.stopPropagation()}
            className="stage-settings-popup bg-white border border-[#ebebe7] rounded-lg shadow-2xl p-1.5 w-52 outline-none animate-in fade-in-50 zoom-in-95 duration-100 z-[90]"
          >
            {/* Header */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-[#787774] uppercase tracking-wider select-none border-b border-[#f1f1ee] pb-1.5 mb-1">
              <Palette className="w-3.5 h-3.5 text-[#9b9a97]" />
              <span>{stageName} Color</span>
            </div>

            {/* Colors Section Header */}
            <div className="px-2.5 py-1 text-[10px] font-medium text-[#9b9a97] uppercase select-none">
              Notion Colors
            </div>

            {/* Colors List */}
            <div className="flex flex-col gap-0.5 max-h-56 overflow-y-auto custom-scrollbar">
              {COLOR_OPTIONS.map((colorKey) => {
                const theme = NOTION_COLUMN_COLORS[colorKey];
                const isSelected = currentColor === colorKey;

                return (
                  <button
                    key={colorKey}
                    type="button"
                    onClick={() => {
                      onSelectColor(colorKey);
                      setIsOpen(false);
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
