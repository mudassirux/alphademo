import { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  PanelRight,
  CalendarDays,
  UserCheck
} from 'lucide-react';
import { STAGES, getLabelColor } from '../types/contact';
import type { Contact, Stage } from '../types/contact';
import { InitialsAvatar } from './ui/InitialsAvatar';
import { ColumnColorMenu } from './ui/ColumnColorMenu';
import {
  NOTION_COLUMN_COLORS,
  getStoredStageColors,
  saveStoredStageColors,
  subscribeToStageColors,
  type NotionColumnColor
} from '../utils/boardColors';

const AGGREGATION_STORAGE_KEY = 'notion_board_show_aggregation_v1';

function getStoredAggregations(): Record<Stage, boolean> {
  const defaults: Record<Stage, boolean> = {
    Lead: true,
    Prospect: true,
    Qualified: true,
    Customer: true
  };
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(AGGREGATION_STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

interface BoardViewProps {
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (contact: Contact, openerEl: HTMLElement) => void;
  onNewContactInStage: (stage: Stage) => void;
  onDeleteStageContacts?: (stage: Stage) => void;
}

export function BoardView({
  contacts,
  selectedContactId,
  onSelectContact,
  onNewContactInStage,
  onDeleteStageContacts
}: BoardViewProps) {
  // Stage column colors with persistence & cross-component subscription
  const [stageColors, setStageColors] = useState<Record<Stage, NotionColumnColor>>(getStoredStageColors);

  useEffect(() => {
    return subscribeToStageColors((updated) => {
      setStageColors(updated);
    });
  }, []);

  const handleSelectColor = (stage: Stage, color: NotionColumnColor) => {
    setStageColors((prev) => {
      const updated = { ...prev, [stage]: color };
      saveStoredStageColors(updated);
      return updated;
    });
  };

  // Aggregation count toggle per column with persistence
  const [aggregations, setAggregations] = useState<Record<Stage, boolean>>(getStoredAggregations);

  const handleToggleAggregation = (stage: Stage) => {
    setAggregations((prev) => {
      const updated = { ...prev, [stage]: !prev[stage] };
      try {
        localStorage.setItem(AGGREGATION_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Partition contacts by stage
  const groupedContacts = useMemo(() => {
    const map: Record<Stage, Contact[]> = {
      Lead: [],
      Prospect: [],
      Qualified: [],
      Customer: []
    };
    contacts.forEach((contact) => {
      if (map[contact.stage]) {
        map[contact.stage].push(contact);
      }
    });
    return map;
  }, [contacts]);

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-6 select-none">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full min-w-[980px] items-start">
        {STAGES.map((stage) => {
          const stageContacts = groupedContacts[stage];
          const count = stageContacts.length;
          const colorName = stageColors[stage] || 'Default';
          const colorTheme = NOTION_COLUMN_COLORS[colorName];

          return (
            <div
              key={stage}
              className="flex flex-col rounded-lg p-2 min-h-[420px] transition-colors duration-150 border"
              style={{
                backgroundColor: colorTheme.colBg,
                borderColor: colorTheme.colBorder
              }}
            >
              {/* Column Header: Notion Pill Badge + Count + Actions */}
              <div className="flex items-center justify-between px-1.5 py-1 mb-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium tracking-tight select-none truncate"
                    style={{
                      backgroundColor: colorTheme.pillBg,
                      color: colorTheme.pillText
                    }}
                  >
                    {stage}
                  </span>
                  {aggregations[stage] && (
                    <span className="text-[11px] font-medium text-[#8c8c85] px-1 py-0.2 shrink-0">
                      {count}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <ColumnColorMenu
                    currentColor={colorName}
                    onSelectColor={(color) => handleSelectColor(stage, color)}
                    stageName={stage}
                    showAggregation={aggregations[stage]}
                    onToggleAggregation={() => handleToggleAggregation(stage)}
                    onMoveToTrash={() => onDeleteStageContacts?.(stage)}
                  />
                  <button
                    type="button"
                    onClick={() => onNewContactInStage(stage)}
                    title={`Add contact to ${stage}`}
                    className="p-1 hover:bg-black/5 rounded cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" style={{ color: colorTheme.pillText }} />
                  </button>
                </div>
              </div>

              {/* Cards Container */}
              <div className="flex flex-col gap-2 flex-1">
                {stageContacts.map((contact) => {
                  const cardId = `contact-card-${contact.id}`;
                  const isSelected = selectedContactId === contact.id;

                  return (
                    <div
                      key={contact.id}
                      id={cardId}
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
                      className={`group p-3.5 bg-white rounded-md border transition-all text-left outline-none cursor-pointer ${
                        isSelected
                          ? 'border-[#2383e2] ring-1 ring-[#2383e2] shadow-xs'
                          : 'border-[#ebebe7] hover:border-[#d7d7d1] hover:shadow-xs'
                      }`}
                    >
                      {/* Name & Avatar */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <InitialsAvatar name={contact.name} variant="contact" />
                          <h4 className="text-[13.5px] font-semibold text-[#1f1f1d] group-hover:text-[#2383e2] transition-colors truncate tracking-tight">
                            {contact.name}
                          </h4>
                        </div>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#9b9a97] hover:text-[#2e2e2a]">
                          <PanelRight className="w-3.5 h-3.5" />
                        </span>
                      </div>

                      {/* Company, Role & Email */}
                      {(contact.role || contact.company || contact.email) && (
                        <div className="mb-2.5 space-y-0.5">
                          {(contact.role || contact.company) && (
                            <p className="text-xs text-[#55554e] truncate leading-snug">
                              {contact.role && (
                                <span className="font-medium text-[#2e2e2a]">
                                  {contact.role}
                                </span>
                              )}
                              {contact.role && contact.company && (
                                <span className="text-[#9b9a97] mx-1 font-normal">•</span>
                              )}
                              {contact.company && (
                                <span className="text-[#60605a] font-normal">
                                  {contact.company}
                                </span>
                              )}
                            </p>
                          )}
                          {contact.email && (
                            <p className="text-[11px] text-[#787774] truncate leading-normal">
                              {contact.email}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Labels (up to 2 chips with Notion pastel colors) */}
                      {contact.labels && contact.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2.5">
                          {contact.labels.slice(0, 2).map((label) => {
                            const style = getLabelColor(label);
                            return (
                              <span
                                key={label}
                                className="inline-flex items-center text-[11px] py-0.5 px-2 rounded font-medium border truncate max-w-[130px]"
                                style={{
                                  backgroundColor: style.bg,
                                  color: style.text,
                                  borderColor: style.border
                                }}
                              >
                                {label}
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Card Footer: Owner */}
                      <div className="flex items-center justify-between pt-2 border-t border-[#f1f1ee] text-[11px]">
                        <span className="truncate">
                          {contact.owner && contact.owner !== 'Unassigned' ? (
                            <span className="text-[#55554e] font-medium flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-[#787774] shrink-0" />
                              <span className="truncate">{contact.owner}</span>
                            </span>
                          ) : (
                            <span className="text-[#9b9a97] flex items-center gap-1.5 italic">
                              <UserCheck className="w-3.5 h-3.5 text-[#b5b5ae] shrink-0" />
                              <span>Unassigned</span>
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Empty Column Placeholder */}
                {count === 0 && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-[#dcdcd6] rounded-md bg-white/60">
                    <div className="w-8 h-8 rounded-full bg-[#f1f1ee] flex items-center justify-center text-[#9b9a97] mb-2">
                      <CalendarDays className="w-4 h-4 text-[#9b9a97]" />
                    </div>
                    <span className="text-xs font-semibold text-[#55554e] mb-0.5">
                      {stage === 'Customer' ? 'No customers yet' : `No ${stage.toLowerCase()}s yet`}
                    </span>
                    <span className="text-[11px] text-[#9b9a97] mb-3 max-w-[180px] leading-relaxed">
                      Contacts moved to this stage will appear here.
                    </span>
                    <button
                      type="button"
                      onClick={() => onNewContactInStage(stage)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#2e2e2a] bg-white border border-[#d7d7d1] rounded-md hover:bg-[#f8f8f6] transition-colors cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add contact</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Column "+ New" Button */}
              {count > 0 && (
                <button
                  type="button"
                  onClick={() => onNewContactInStage(stage)}
                  className="mt-2 w-full flex items-center gap-1.5 py-1.5 px-2 text-xs text-[#787774] hover:text-[#2e2e2a] hover:bg-[#f0f0ed] rounded transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="font-medium">New</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
