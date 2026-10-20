import { useState, useMemo, useEffect, useCallback } from 'react';
import { Check } from 'lucide-react';
import { Header } from './components/Header';
import { DatabaseToolbar } from './components/DatabaseToolbar';
import { Subtoolbar } from './components/Subtoolbar';
import { TableView } from './components/TableView';
import { BoardView } from './components/BoardView';
import { DetailsPanel } from './components/DetailsPanel';
import { INITIAL_CONTACTS } from './data/mockContacts';
import { STAGES } from './types/contact';
import type { Contact, ContactDraft, Stage, ViewMode, SortOption } from './types/contact';
import { subscribeToLabels } from './utils/labelStore';

export function App() {
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [, setLabelsVersion] = useState(0);

  // Re-render on global label additions, renames, recolors
  useEffect(() => {
    return subscribeToLabels(() => {
      setLabelsVersion((v) => v + 1);
    });
  }, []);
  const [activeView, setActiveView] = useState<ViewMode>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState<'All stages' | Stage>('All stages');
  const [sortBy, setSortBy] = useState<SortOption>('Name');

  // Multi-row selection state for checkboxes & keyboard shortcut
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // Slide-over Drawer State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [isNewContact, setIsNewContact] = useState(false);
  const [defaultNewStage, setDefaultNewStage] = useState<Stage>('Lead');
  const [openerEl, setOpenerEl] = useState<HTMLElement | null>(null);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string>('');

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => {
      setToastMessage('');
    }, 2800);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  // Derived filtered & sorted records
  const visibleContacts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = contacts.filter((contact) => {
      const matchesSearch =
        !query ||
        contact.name.toLowerCase().includes(query) ||
        contact.email.toLowerCase().includes(query) ||
        contact.company.toLowerCase().includes(query);

      const matchesStage =
        stageFilter === 'All stages' || contact.stage === stageFilter;

      return matchesSearch && matchesStage;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'Company') {
        return (a.company || '\uffff').localeCompare(b.company || '\uffff');
      }
      if (sortBy === 'Stage') {
        return (
          STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage) ||
          a.name.localeCompare(b.name)
        );
      }
      return a.name.localeCompare(b.name);
    });
  }, [contacts, searchQuery, stageFilter, sortBy]);

  // Selected contact entity
  const selectedContact = useMemo(() => {
    if (!selectedContactId) return null;
    return contacts.find((c) => c.id === selectedContactId) || null;
  }, [contacts, selectedContactId]);

  // Handlers for Opening Panel
  const handleOpenExistingContact = (contact: Contact, triggerEl: HTMLElement) => {
    setOpenerEl(triggerEl);
    setSelectedContactId(contact.id);
    setIsNewContact(false);
    setIsEditorOpen(true);
  };

  const handleOpenNewContact = (stage: Stage = 'Lead') => {
    setOpenerEl(document.activeElement as HTMLElement | null);
    setSelectedContactId(null);
    setDefaultNewStage(stage);
    setIsNewContact(true);
    setIsEditorOpen(true);
  };

  const handleClosePanel = () => {
    setIsEditorOpen(false);
    setSelectedContactId(null);
  };

  // Toggle single row selection
  const handleToggleSelectRow = useCallback((id: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Toggle all visible rows selection
  const handleToggleSelectAll = useCallback(() => {
    if (visibleContacts.length === 0) return;
    const allSelected = visibleContacts.every((c) => selectedRowIds.has(c.id));
    if (allSelected) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(visibleContacts.map((c) => c.id)));
    }
  }, [visibleContacts, selectedRowIds]);

  // Batch actions
  const handleBatchStageChange = (newStage: Stage) => {
    const count = selectedRowIds.size;
    setContacts((prev) =>
      prev.map((c) =>
        selectedRowIds.has(c.id) ? { ...c, stage: newStage } : c
      )
    );
    setToastMessage(`Updated stage to ${newStage} for ${count} contacts`);
    setSelectedRowIds(new Set());
  };

  const handleBatchDelete = () => {
    const count = selectedRowIds.size;
    setContacts((prev) => prev.filter((c) => !selectedRowIds.has(c.id)));
    setSelectedRowIds(new Set());
    setToastMessage(`Deleted ${count} ${count === 1 ? 'contact' : 'contacts'}`);
  };

  const handleDeleteStageContacts = (stage: Stage) => {
    const stageContacts = contacts.filter((c) => c.stage === stage);
    const count = stageContacts.length;
    setContacts((prev) => prev.filter((c) => c.stage !== stage));
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      stageContacts.forEach((c) => next.delete(c.id));
      return next;
    });
    setToastMessage(`Moved ${count} ${count === 1 ? 'contact' : 'contacts'} to Trash`);
  };

  // Keyboard shortcut listener for Cmd+A / Ctrl+A and Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+A (Mac) or Ctrl+A (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') {
        const target = document.activeElement;
        const isInput =
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target?.getAttribute('contenteditable') === 'true';

        if (!isInput && activeView === 'table' && visibleContacts.length > 0) {
          e.preventDefault();
          setSelectedRowIds(new Set(visibleContacts.map((c) => c.id)));
          setToastMessage(`Selected all ${visibleContacts.length} contacts`);
        }
      }

      if (e.key === 'Escape' && !isEditorOpen) {
        setSelectedRowIds((prev) => (prev.size > 0 ? new Set() : prev));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeView, visibleContacts, isEditorOpen]);

  // Commit Handler (triggered on Save / Create)
  const handleSaveContact = (draft: ContactDraft, isNew: boolean) => {
    if (isNew) {
      const newContact: Contact = {
        id: `contact-${crypto.randomUUID()}`,
        name: draft.name,
        email: draft.email,
        company: draft.company,
        role: draft.role,
        owner: draft.owner,
        labels: draft.labels,
        stage: draft.stage,
        notes: draft.notes,
        avatarColor: '#2383e2'
      };
      setContacts((prev) => [newContact, ...prev]);
      setToastMessage('Contact created');
    } else if (selectedContactId) {
      setContacts((prev) =>
        prev.map((c) =>
          c.id === selectedContactId
            ? {
                ...c,
                name: draft.name,
                email: draft.email,
                company: draft.company,
                role: draft.role,
                owner: draft.owner,
                labels: draft.labels,
                stage: draft.stage,
                notes: draft.notes
              }
            : c
        )
      );
      setToastMessage('Changes saved');
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#2e2e2a] flex flex-col font-sans">
      {/* Page Heading */}
      <Header totalCount={contacts.length} />

      {/* Main Database Container (Full Width Edge-to-Edge) */}
      <main className="flex-1 w-full px-6 sm:px-10 lg:px-12 pb-12 flex flex-col">
        {/* Database View Toolbar */}
        <DatabaseToolbar
          activeView={activeView}
          onViewChange={setActiveView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          stageFilter={stageFilter}
          onStageFilterChange={setStageFilter}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onNewContact={() => handleOpenNewContact('Lead')}
        />

        {/* Subtoolbar with Active Filter & Counter */}
        <Subtoolbar
          totalCount={contacts.length}
          filteredCount={visibleContacts.length}
          stageFilter={stageFilter}
          onClearStageFilter={() => setStageFilter('All stages')}
          searchQuery={searchQuery}
        />

        {/* View Surface: Table or Board */}
        <div className="flex-1">
          {activeView === 'table' ? (
            <TableView
              contacts={visibleContacts}
              selectedContactId={selectedContactId}
              selectedRowIds={selectedRowIds}
              onToggleSelectRow={handleToggleSelectRow}
              onToggleSelectAll={handleToggleSelectAll}
              onSelectContact={handleOpenExistingContact}
              onNewContact={() => handleOpenNewContact('Lead')}
              onResetFilters={() => {
                setSearchQuery('');
                setStageFilter('All stages');
              }}
            />
          ) : (
            <BoardView
              contacts={visibleContacts}
              selectedContactId={selectedContactId}
              onSelectContact={handleOpenExistingContact}
              onNewContactInStage={(stage) => handleOpenNewContact(stage)}
              onDeleteStageContacts={handleDeleteStageContacts}
            />
          )}
        </div>
      </main>

      {/* Floating Batch Action Toolbar */}
      {selectedRowIds.size > 0 && activeView === 'table' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#2e2e2a] text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-150 border border-[#454540]">
          <span className="text-xs font-semibold px-2 py-0.5 bg-[#454540] rounded-md">
            {selectedRowIds.size} selected
          </span>

          <div className="h-4 w-px bg-[#55554e]" />

          {/* Quick Stage Change */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[#b5b5ae] text-[11px]">Move to:</span>
            {STAGES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => handleBatchStageChange(s)}
                className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#3c3c37] hover:bg-[#4d4d46] transition-colors cursor-pointer"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-[#55554e]" />

          <button
            type="button"
            onClick={handleBatchDelete}
            className="text-xs text-red-400 hover:text-red-300 font-medium px-2 py-0.5 hover:bg-red-950/40 rounded transition-colors cursor-pointer"
          >
            Delete
          </button>

          <button
            type="button"
            onClick={() => setSelectedRowIds(new Set())}
            className="text-xs text-[#b5b5ae] hover:text-white font-medium px-2 py-0.5 hover:bg-[#454540] rounded transition-colors cursor-pointer"
          >
            Deselect
          </button>
        </div>
      )}

      {/* Slide-over Profile Drawer (Base UI Dialog) */}
      <DetailsPanel
        isOpen={isEditorOpen}
        contact={selectedContact}
        isNew={isNewContact}
        defaultStage={defaultNewStage}
        openerEl={openerEl}
        onSave={handleSaveContact}
        onClose={handleClosePanel}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-container" role="status">
          <Check className="w-4 h-4 text-[#43b581]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default App;
