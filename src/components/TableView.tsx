import { useState, useCallback, useRef } from 'react';
import {
  Building2,
  Briefcase,
  UserRound,
  CircleDot,
  Plus,
  SearchX,
  Check,
  Minus,
  PanelRight,
  FileText,
  AtSign,
  MoreHorizontal
} from 'lucide-react';
import type { Contact } from '../types/contact';
import { getStageTheme } from '../utils/boardColors';

interface TableViewProps {
  contacts: Contact[];
  selectedContactId: string | null;
  selectedRowIds: Set<string>;
  onToggleSelectRow: (id: string) => void;
  onToggleSelectAll: () => void;
  onSelectContact: (contact: Contact, openerEl: HTMLElement) => void;
  onNewContact: () => void;
  onResetFilters: () => void;
}

interface ColumnDef {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  defaultWidth: number;
  minWidth: number;
}

const AaIcon = () => (
  <span className="font-semibold text-xs leading-none text-[#9b9a97] tracking-tight">Aa</span>
);

const COLUMNS: ColumnDef[] = [
  { id: 'name', label: 'Name', icon: AaIcon, defaultWidth: 220, minWidth: 140 },
  { id: 'email', label: 'Email', icon: AtSign, defaultWidth: 240, minWidth: 140 },
  { id: 'role', label: 'Role', icon: Briefcase, defaultWidth: 180, minWidth: 120 },
  { id: 'stage', label: 'Stage', icon: CircleDot, defaultWidth: 130, minWidth: 90 },
  { id: 'company', label: 'Company', icon: Building2, defaultWidth: 160, minWidth: 110 },
  { id: 'owner', label: 'Owner', icon: UserRound, defaultWidth: 140, minWidth: 100 }
];

const DEFAULT_WIDTHS: Record<string, number> = Object.fromEntries(
  COLUMNS.map((c) => [c.id, c.defaultWidth])
);

export function TableView({
  contacts,
  selectedContactId,
  selectedRowIds,
  onToggleSelectRow,
  onToggleSelectAll,
  onSelectContact,
  onNewContact,
  onResetFilters
}: TableViewProps) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(DEFAULT_WIDTHS);
  const [resizingCol, setResizingCol] = useState<string | null>(null);
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);
  const activeColRef = useRef<string | null>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const isAllSelected = contacts.length > 0 && contacts.every((c) => selectedRowIds.has(c.id));
  const isIndeterminate = selectedRowIds.size > 0 && !isAllSelected;

  const handleResizeStart = useCallback(
    (colId: string, clientX: number) => {
      activeColRef.current = colId;
      startXRef.current = clientX;
      startWidthRef.current = columnWidths[colId] || DEFAULT_WIDTHS[colId];
      setResizingCol(colId);

      const colDef = COLUMNS.find((c) => c.id === colId);
      const minWidth = colDef?.minWidth || 80;

      const handleMouseMove = (e: MouseEvent) => {
        if (!activeColRef.current) return;
        const delta = e.clientX - startXRef.current;
        const newWidth = Math.max(minWidth, startWidthRef.current + delta);
        setColumnWidths((prev) => ({
          ...prev,
          [activeColRef.current!]: newWidth
        }));
      };

      const handleMouseUp = () => {
        activeColRef.current = null;
        setResizingCol(null);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [columnWidths]
  );

  const handleResetColumnWidth = (colId: string) => {
    setColumnWidths((prev) => ({
      ...prev,
      [colId]: DEFAULT_WIDTHS[colId]
    }));
  };

  const totalTableWidth =
    40 +
    COLUMNS.reduce((acc, col) => acc + (columnWidths[col.id] || col.defaultWidth), 0) +
    64;

  if (contacts.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg border border-[#ebebe7] p-12 flex flex-col items-center justify-center text-center">
        <div className="w-10 h-10 rounded-full bg-[#f8f8f6] flex items-center justify-center text-[#9b9a97] mb-3">
          <SearchX className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-[#2e2e2a] mb-1">
          No matching contacts found
        </h3>
        <p className="text-xs text-[#787774] max-w-sm mb-4">
          Try adjusting your search query, clearing your stage filter, or create a new contact.
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onResetFilters}
            className="px-3 py-1.5 text-xs font-medium text-[#60605a] bg-[#f8f8f6] hover:bg-[#efefeb] border border-[#ebebe7] rounded-md transition-colors cursor-pointer"
          >
            Reset filters
          </button>
          <button
            type="button"
            onClick={onNewContact}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2383e2] hover:bg-[#1b6fc2] rounded-md transition-colors cursor-pointer shadow-xs"
          >
            Create contact
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table
        className="text-left border-collapse group/table w-full"
        style={{ minWidth: `${totalTableWidth}px` }}
      >
        <thead>
          <tr className="border-b border-[#ebebe7] bg-white text-xs font-medium text-[#787774] select-none h-9">
            {/* Checkbox Column Header */}
            <th
              scope="col"
              className="w-10 min-w-[40px] max-w-[40px] h-9 py-0 px-2.5 border-r border-[#f1f1ee] text-center align-middle select-none"
            >
              <button
                type="button"
                onClick={onToggleSelectAll}
                aria-label="Select all contacts"
                className={`w-4 h-4 min-w-[16px] min-h-[16px] max-w-[16px] max-h-[16px] rounded border transition-colors inline-flex items-center justify-center cursor-pointer shrink-0 leading-none ${
                  isAllSelected || isIndeterminate
                    ? 'bg-[#2383e2] border-[#2383e2] text-white opacity-100'
                    : 'border-[#d7d7d1] hover:border-[#9b9a97] bg-white opacity-0 group-hover/table:opacity-100 focus:opacity-100'
                }`}
              >
                {isAllSelected && <Check className="w-3 h-3 stroke-[3] shrink-0" />}
                {isIndeterminate && <Minus className="w-3 h-3 stroke-[3] shrink-0" />}
              </button>
            </th>

            {COLUMNS.map((col, idx) => {
              const Icon = col.icon;
              const width = columnWidths[col.id] || col.defaultWidth;
              const isResizing = resizingCol === col.id;
              const isHovered = hoveredCol === col.id;
              const isLast = idx === COLUMNS.length - 1;

              return (
                <th
                  key={col.id}
                  scope="col"
                  style={{ width: `${width}px`, minWidth: `${col.minWidth}px` }}
                  className={`relative py-2 px-3 border-r border-[#f1f1ee] transition-shadow ${
                    isResizing
                      ? 'ring-2 ring-[#2383e2] ring-inset bg-[#edf5fd]/50 text-[#2383e2]'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-[#787774]">
                    <Icon className="w-3.5 h-3.5 text-[#9b9a97]" />
                    <span className="truncate">{col.label}</span>
                  </div>

                  {/* Resizing Handle & Tooltip */}
                  {!isLast && (
                    <div
                      role="separator"
                      aria-orientation="vertical"
                      title="Drag to resize column, double-click to reset"
                      onMouseEnter={() => setHoveredCol(col.id)}
                      onMouseLeave={() => setHoveredCol(null)}
                      onMouseDown={(e) => handleResizeStart(col.id, e.clientX)}
                      onDoubleClick={() => handleResetColumnWidth(col.id)}
                      className="absolute right-0 top-0 bottom-0 w-3 -mr-1.5 cursor-col-resize flex items-center justify-center group/handle select-none z-30"
                    >
                      {/* Active indicator line */}
                      <div
                        className={`w-[2px] h-full transition-colors ${
                          isResizing
                            ? 'bg-[#2383e2]'
                            : isHovered
                            ? 'bg-[#2383e2]/60'
                            : 'bg-transparent group-hover/handle:bg-[#2383e2]/50'
                        }`}
                      />

                      {/* Tooltip Badge: "Resize column" matching Image 2 */}
                      {(isHovered || isResizing) && (
                        <div className="absolute -top-7 right-0 translate-x-1/2 z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-100">
                          <div className="bg-[#0b192c] text-white text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded shadow-lg whitespace-nowrap flex items-center gap-1">
                            <span>Resize column</span>
                          </div>
                          <div className="w-1.5 h-1.5 bg-[#0b192c] rotate-45 mx-auto -mt-0.5" />
                        </div>
                      )}
                    </div>
                  )}
                </th>
              );
            })}

            {/* Trailing Notion property actions: + and ... matching Image 1 */}
            <th
              scope="col"
              className="w-16 min-w-[64px] max-w-[64px] py-2 px-2 border-r border-[#f1f1ee] text-[#9b9a97] select-none"
            >
              <div className="flex items-center justify-center gap-1">
                <button
                  type="button"
                  title="Add property"
                  className="p-1 text-[#9b9a97] hover:text-[#2e2e2a] hover:bg-[#f1f1ee] rounded transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  title="More options"
                  className="p-1 text-[#9b9a97] hover:text-[#2e2e2a] hover:bg-[#f1f1ee] rounded transition-colors cursor-pointer"
                >
                  <MoreHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </th>

            {/* Trailing stretch header to let grid extend full-width */}
            <th scope="col" className="py-2 px-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#ebebe7] text-xs text-[#2e2e2a]">
          {contacts.map((contact) => {
            const isSelected = selectedContactId === contact.id;
            const isRowSelected = selectedRowIds.has(contact.id);
            const rowId = `contact-row-${contact.id}`;

            return (
              <tr
                key={contact.id}
                id={rowId}
                tabIndex={0}
                role="button"
                aria-label={`Open details for ${contact.name}`}
                onClick={(e) => onSelectContact(contact, e.currentTarget)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectContact(contact, e.currentTarget);
                  }
                }}
                className={`group cursor-pointer transition-colors outline-none h-10 ${
                  isRowSelected
                    ? 'bg-[#edf5fd]'
                    : isSelected
                    ? 'bg-[#f3f7fb]'
                    : 'hover:bg-[#fbfbfa]'
                }`}
              >
                {/* Row Checkbox (Visible on hover or when selected) */}
                <td
                  className="w-10 min-w-[40px] max-w-[40px] h-10 py-0 px-2.5 border-r border-[#f1f1ee] text-center align-middle"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onToggleSelectRow(contact.id)}
                    aria-label={`Select ${contact.name}`}
                    className={`w-4 h-4 min-w-[16px] min-h-[16px] max-w-[16px] max-h-[16px] rounded border transition-colors inline-flex items-center justify-center cursor-pointer shrink-0 leading-none ${
                      isRowSelected
                        ? 'bg-[#2383e2] border-[#2383e2] text-white opacity-100'
                        : 'border-[#d7d7d1] hover:border-[#9b9a97] bg-white opacity-0 group-hover:opacity-100 focus:opacity-100'
                    }`}
                  >
                    <Check
                      className={`w-3 h-3 stroke-[3] shrink-0 transition-opacity ${
                        isRowSelected ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                  </button>
                </td>

                {/* 1. Name with Notion Page Icon matching Image 1 */}
                <td
                  style={{ width: `${columnWidths.name || 220}px` }}
                  className="h-10 py-0 px-3 border-r border-[#f1f1ee] align-middle"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-[#787774] shrink-0 stroke-[1.6]" />
                      <span className="font-semibold text-[#2e2e2a] group-hover:text-[#2383e2] transition-colors truncate">
                        {contact.name}
                      </span>
                    </div>

                    {/* Hover OPEN button matching Image 1 */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectContact(contact, e.currentTarget);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-[#55554e] hover:text-[#2e2e2a] bg-white border border-[#d7d7d1] hover:border-[#b5b5ae] rounded shadow-2xs cursor-pointer shrink-0"
                    >
                      <PanelRight className="w-3 h-3 text-[#9b9a97]" />
                      <span>OPEN</span>
                    </button>
                  </div>
                </td>

                {/* 2. Email matching Image 1 */}
                <td
                  style={{ width: `${columnWidths.email || 240}px` }}
                  className="h-10 py-0 px-3 border-r border-[#f1f1ee] align-middle"
                >
                  {contact.email ? (
                    <span className="text-[#55554e] truncate block">
                      {contact.email}
                    </span>
                  ) : null}
                </td>

                {/* 3. Role matching Image 1 */}
                <td
                  style={{ width: `${columnWidths.role || 180}px` }}
                  className="h-10 py-0 px-3 border-r border-[#f1f1ee] align-middle"
                >
                  {contact.role ? (
                    <span className="text-[#55554e] truncate block">
                      {contact.role}
                    </span>
                  ) : null}
                </td>

                {/* 4. Stage matching Image 1 */}
                <td
                  style={{ width: `${columnWidths.stage || 130}px` }}
                  className="h-10 py-0 px-3 border-r border-[#f1f1ee] align-middle"
                >
                  {(() => {
                    const stageTheme = getStageTheme(contact.stage);
                    return (
                      <span
                        className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border select-none transition-colors"
                        style={{
                          backgroundColor: stageTheme.pillBg,
                          color: stageTheme.pillText,
                          borderColor: stageTheme.swatchBorder
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: stageTheme.pillText }}
                        />
                        <span>{contact.stage}</span>
                      </span>
                    );
                  })()}
                </td>

                {/* 5. Company matching Image 1 */}
                <td
                  style={{ width: `${columnWidths.company || 160}px` }}
                  className="h-10 py-0 px-3 border-r border-[#f1f1ee] align-middle"
                >
                  {contact.company ? (
                    <span className="text-[#37352f] truncate block">
                      {contact.company}
                    </span>
                  ) : null}
                </td>

                {/* 6. Owner matching Image 1 */}
                <td
                  style={{ width: `${columnWidths.owner || 140}px` }}
                  className="h-10 py-0 px-3 border-r border-[#f1f1ee] align-middle"
                >
                  {contact.owner && contact.owner !== 'Unassigned' ? (
                    <span className="text-[#55554e] truncate block">
                      {contact.owner}
                    </span>
                  ) : null}
                </td>

                {/* Trailing empty cells matching + and ... and stretch column */}
                <td className="w-16 min-w-[64px] max-w-[64px] h-10 py-0 px-2 border-r border-[#f1f1ee] align-middle"></td>
                <td className="h-10 py-0 px-3 align-middle"></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Inline Bottom "+ New row" Trigger */}
      <button
        type="button"
        onClick={onNewContact}
        className="flex items-center gap-2 py-2 px-3 text-xs text-[#9b9a97] hover:text-[#2e2e2a] hover:bg-[#f7f7f5] border-b border-[#f1f1ee] transition-colors cursor-pointer text-left w-full"
        style={{ minWidth: `${totalTableWidth}px` }}
      >
        <Plus className="w-3.5 h-3.5" />
        <span className="font-medium">New</span>
      </button>
    </div>
  );
}

