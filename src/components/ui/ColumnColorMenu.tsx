import { useState } from 'react';
import { Popover, Dialog } from '@base-ui/react';
import {
  MoreHorizontal,
  Check,
  Eye,
  EyeOff,
  Trash2
} from 'lucide-react';
import {
  COLOR_OPTIONS,
  NOTION_COLUMN_COLORS,
  type NotionColumnColor
} from '../../utils/boardColors';

interface ColumnColorMenuProps {
  currentColor: NotionColumnColor;
  onSelectColor: (color: NotionColumnColor) => void;
  stageName: string;
  showAggregation: boolean;
  onToggleAggregation: () => void;
  onMoveToTrash?: () => void;
}

export function ColumnColorMenu({
  currentColor,
  onSelectColor,
  stageName,
  showAggregation,
  onToggleAggregation,
  onMoveToTrash
}: ColumnColorMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  return (
    <>
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger
          type="button"
          aria-label={`Options for ${stageName}`}
          className="p-1 text-[#9b9a97] hover:text-[#2e2e2a] hover:bg-black/5 rounded cursor-pointer transition-colors"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Positioner sideOffset={4} align="start" className="z-50">
            <Popover.Popup className="bg-white border border-[#ebebe7] rounded-lg shadow-lg p-1.5 w-52 outline-none animate-in fade-in-50 zoom-in-95 duration-100">
              {/* Top Group Actions */}
              <div className="flex flex-col gap-0.5 pb-0.5">
                <button
                  type="button"
                  onClick={() => {
                    onToggleAggregation();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-[#2e2e2a] hover:bg-[#f1f1ee] rounded transition-colors cursor-pointer text-left"
                >
                  {showAggregation ? (
                    <>
                      <EyeOff className="w-4 h-4 text-[#787774] shrink-0" />
                      <span>Hide aggregation</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 text-[#787774] shrink-0" />
                      <span>Show aggregation</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsConfirmOpen(true);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-[#2e2e2a] hover:bg-[#fde8e8] hover:text-[#e03e3e] rounded transition-colors cursor-pointer text-left group"
                >
                  <Trash2 className="w-4 h-4 text-[#787774] group-hover:text-[#e03e3e] shrink-0 transition-colors" />
                  <span>Move to Trash</span>
                </button>
              </div>

            {/* Divider */}
            <div className="h-px bg-[#ebebe7] my-1" />

            {/* Colors Section */}
            <div className="text-[11px] font-semibold text-[#787774] px-2.5 py-1 mb-0.5 select-none">
              Colors
            </div>
            <div className="flex flex-col gap-0.5 max-h-56 overflow-y-auto custom-scrollbar">
              {COLOR_OPTIONS.map((colorName) => {
                const theme = NOTION_COLUMN_COLORS[colorName];
                const isSelected = currentColor === colorName;

                return (
                  <button
                    key={colorName}
                    type="button"
                    onClick={() => {
                      onSelectColor(colorName);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1 text-xs text-[#2e2e2a] hover:bg-[#f1f1ee] rounded transition-colors cursor-pointer text-left ${
                      isSelected ? 'font-medium' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className="w-4 h-4 rounded-[3px] shrink-0 border"
                        style={{
                          backgroundColor: theme.swatchBg,
                          borderColor: theme.swatchBorder
                        }}
                      />
                      <span className="truncate">{colorName}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-[#2e2e2a] stroke-[2.5] shrink-0 ml-1.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>

      {/* Move to Trash Confirmation Dialog */}
      <Dialog.Root open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/30 z-50 backdrop-blur-[1px] animate-in fade-in-50 duration-150" />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Popup className="bg-white rounded-xl border border-[#ebebe7] shadow-2xl max-w-sm w-full p-5 outline-none animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#fde8e8] flex items-center justify-center text-[#e03e3e] shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <Dialog.Title className="text-sm font-semibold text-[#2e2e2a]">
                    Move {stageName} contacts to Trash?
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-[#787774] mt-1.5 leading-relaxed">
                    All contacts currently in the <span className="font-semibold text-[#2e2e2a]">{stageName}</span> stage will be removed from your directory.
                  </Dialog.Description>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f1ee]">
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#55554e] hover:text-[#2e2e2a] hover:bg-[#f1f1ee] rounded-md transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmOpen(false);
                    onMoveToTrash?.();
                  }}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#eb5757] hover:bg-[#d93838] rounded-md transition-colors cursor-pointer shadow-xs"
                >
                  Move to Trash
                </button>
              </div>
            </Dialog.Popup>
          </div>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
