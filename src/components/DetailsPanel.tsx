import { useState, useEffect, useMemo, useRef } from 'react';
import type { FormEvent } from 'react';
import { Dialog } from '@base-ui/react';
import {
  X,
  Mail,
  Building2,
  UserRound,
  Check,
  Table2,
  AlertTriangle
} from 'lucide-react';
import { OwnerSelect } from './ui/OwnerSelect';
import { StageSelect } from './ui/StageSelect';
import { LabelMultiSelect } from './ui/LabelMultiSelect';
import type { Contact, ContactDraft, Stage } from '../types/contact';
import { createBlankDraft, getContactDraft } from '../data/mockContacts';
import { InitialsAvatar } from './ui/InitialsAvatar';

interface DetailsPanelProps {
  isOpen: boolean;
  contact: Contact | null;
  isNew: boolean;
  defaultStage?: Stage;
  openerEl: HTMLElement | null;
  onSave: (draft: ContactDraft, isNew: boolean) => void;
  onClose: () => void;
}

interface DrawerContentProps {
  contact: Contact | null;
  isNew: boolean;
  defaultStage: Stage;
  onSave: (draft: ContactDraft, isNew: boolean) => void;
  onRequestClose: (isDirty: boolean) => void;
  onCancel: () => void;
  onDirtyChange: (isDirty: boolean) => void;
}

function DrawerContent({
  contact,
  isNew,
  defaultStage,
  onSave,
  onRequestClose,
  onCancel,
  onDirtyChange
}: DrawerContentProps) {
  const [draft, setDraft] = useState<ContactDraft>(() =>
    isNew || !contact ? createBlankDraft(defaultStage) : getContactDraft(contact)
  );
  const [formError, setFormError] = useState<string>('');
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 60);
    return () => clearTimeout(timer);
  }, []);

  const isDirty = useMemo(() => {
    if (isNew) {
      const blank = createBlankDraft(defaultStage);
      return JSON.stringify(draft) !== JSON.stringify(blank);
    }
    if (!contact) return false;
    return JSON.stringify(draft) !== JSON.stringify(getContactDraft(contact));
  }, [isNew, contact, draft, defaultStage]);

  useEffect(() => {
    onDirtyChange(isDirty);
  }, [isDirty, onDirtyChange]);

  const updateDraft = <K extends keyof ContactDraft>(key: K, value: ContactDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setFormError('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const cleanName = draft.name.trim();

    if (!cleanName) {
      setFormError('Please provide a name for this contact.');
      nameInputRef.current?.focus();
      return;
    }

    if (draft.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())) {
      setFormError('Please enter a valid email address, or leave it blank.');
      return;
    }

    const cleanDraft: ContactDraft = {
      ...draft,
      name: cleanName,
      email: draft.email.trim(),
      company: draft.company.trim(),
      role: draft.role.trim(),
      owner: draft.owner || 'Unassigned',
      labels: draft.labels.map((l) => l.trim()).filter(Boolean),
      stage: draft.stage,
      notes: draft.notes.trim()
    };

    onSave(cleanDraft, isNew);
    onRequestClose(false);
  };

  return (
    <>
      {/* Topbar / Breadcrumb */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#ebebe7] bg-[#fbfbfa]">
        <div className="flex items-center gap-1.5 text-xs text-[#787774]">
          <Table2 className="w-3.5 h-3.5 text-[#9b9a97]" />
          <span className="font-medium text-[#2e2e2a]">Contact Directory</span>
          <span className="text-[#b5b5ae]">/</span>
          <span className="text-[#787774] truncate max-w-[200px]">
            {isNew ? 'New contact' : draft.name || 'Details'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onRequestClose(isDirty)}
          className="p-1 text-[#787774] hover:text-[#2e2e2a] hover:bg-[#eeeee9] rounded-md transition-colors cursor-pointer"
          aria-label="Close panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Contact Identity Banner */}
      <div className="p-5 border-b border-[#f1f1ee] flex items-center gap-3.5 bg-white">
        {draft.name.trim() ? (
          <InitialsAvatar name={draft.name} variant="contact" size="lg" />
        ) : (
          <div className="w-10 h-10 min-w-10 max-w-10 aspect-square rounded-lg bg-[#e8ecf2] border border-[#d8e0ea] flex items-center justify-center text-[#475569] shrink-0">
            <UserRound className="w-5 h-5 text-[#475569]" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <Dialog.Title className="text-base font-bold text-[#2e2e2a] truncate">
            {isNew ? 'New contact' : draft.name || 'Untitled contact'}
          </Dialog.Title>
          <Dialog.Description className="text-xs text-[#787774] truncate">
            {isNew
              ? 'Add someone to your database.'
              : draft.company || draft.role
              ? `${draft.company}${draft.company && draft.role ? ' • ' : ''}${draft.role}`
              : 'Contact properties & activity notes'}
          </Dialog.Description>
        </div>
      </div>

      {/* Form Scroll Body */}
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
          <div className="text-[11px] font-bold text-[#9b9a97] uppercase tracking-wider mb-2">
            Contact Information
          </div>

          {/* Name */}
          <div>
            <label
              htmlFor="contact-name"
              className="block text-xs font-semibold text-[#55554e] mb-1"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="contact-name"
              ref={nameInputRef}
              type="text"
              value={draft.name}
              onChange={(e) => updateDraft('name', e.target.value)}
              placeholder="Full name"
              className="w-full text-xs px-3 py-2 bg-white border border-[#d7d7d1] rounded-md text-[#2e2e2a] placeholder-[#b5b5ae] outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="contact-email"
              className="block text-xs font-semibold text-[#55554e] mb-1"
            >
              Email
            </label>
            <div className="relative flex items-center">
              <Mail className="w-3.5 h-3.5 text-[#9b9a97] absolute left-3 pointer-events-none" />
              <input
                id="contact-email"
                type="email"
                value={draft.email}
                onChange={(e) => updateDraft('email', e.target.value)}
                placeholder="name@company.com"
                className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-[#d7d7d1] rounded-md text-[#2e2e2a] placeholder-[#b5b5ae] outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] transition-all"
              />
            </div>
          </div>

          {/* Company */}
          <div>
            <label
              htmlFor="contact-company"
              className="block text-xs font-semibold text-[#55554e] mb-1"
            >
              Company
            </label>
            <div className="relative flex items-center">
              <Building2 className="w-3.5 h-3.5 text-[#9b9a97] absolute left-3 pointer-events-none" />
              <input
                id="contact-company"
                type="text"
                value={draft.company}
                onChange={(e) => updateDraft('company', e.target.value)}
                placeholder="Company name"
                className="w-full text-xs pl-8 pr-3 py-2 bg-white border border-[#d7d7d1] rounded-md text-[#2e2e2a] placeholder-[#b5b5ae] outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] transition-all"
              />
            </div>
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="contact-role"
              className="block text-xs font-semibold text-[#55554e] mb-1"
            >
              Role
            </label>
            <input
              id="contact-role"
              type="text"
              value={draft.role}
              onChange={(e) => updateDraft('role', e.target.value)}
              placeholder="e.g. VP of Product, Engineer"
              className="w-full text-xs px-3 py-2 bg-white border border-[#d7d7d1] rounded-md text-[#2e2e2a] placeholder-[#b5b5ae] outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] transition-all"
            />
          </div>

          {/* Owner */}
          <div>
            <label className="block text-xs font-semibold text-[#55554e] mb-1">
              Owner
            </label>
            <OwnerSelect
              value={draft.owner}
              onChange={(val) => updateDraft('owner', val)}
            />
          </div>

          {/* Labels */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-[#55554e]">
                Labels
              </label>
              <span className="text-[11px] text-[#9b9a97]">
                Multi-select
              </span>
            </div>
            <LabelMultiSelect
              selectedLabels={draft.labels}
              onChange={(labels) => updateDraft('labels', labels)}
            />
          </div>

          {/* Stage */}
          <div>
            <label className="block text-xs font-semibold text-[#55554e] mb-1">
              Stage
            </label>
            <StageSelect
              value={draft.stage}
              onChange={(val) => updateDraft('stage', val)}
            />
            <p className="text-[11px] text-[#9b9a97] mt-1">
              Changing the stage moves the contact across the board and table.
            </p>
          </div>

          {/* Notes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label
                htmlFor="contact-notes"
                className="text-xs font-semibold text-[#55554e]"
              >
                Notes & Activity
              </label>
              <span className="text-[11px] text-[#9b9a97]">
                Plain text
              </span>
            </div>
            <textarea
              id="contact-notes"
              rows={4}
              value={draft.notes}
              onChange={(e) => updateDraft('notes', e.target.value)}
              placeholder="Add notes, follow-up items, or discussion summary..."
              className="w-full text-xs p-3 bg-white border border-[#d7d7d1] rounded-md text-[#2e2e2a] placeholder-[#b5b5ae] outline-none focus:border-[#2383e2] focus:ring-1 focus:ring-[#2383e2] transition-all resize-y"
            />
          </div>

          {/* Form Error Alert */}
          {formError && (
            <div className="p-2.5 rounded-md bg-red-50 border border-red-200 text-xs text-red-700">
              {formError}
            </div>
          )}
        </div>

        {/* Footer Action Bar */}
        <div className="p-4 border-t border-[#ebebe7] bg-[#fbfbfa] flex items-center justify-between">
          <span className="text-xs text-[#787774] flex items-center gap-1.5">
            {isDirty ? (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>Unsaved changes</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5 text-[#35674c]" />
                <span>All changes saved</span>
              </>
            )}
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 text-xs font-medium text-[#60605a] hover:text-[#2e2e2a] hover:bg-[#eeeee9] rounded-md border border-[#ebebe7] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2383e2] hover:bg-[#1b6fc2] rounded-md shadow-xs transition-colors cursor-pointer"
            >
              {isNew ? 'Create contact' : 'Save changes'}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export function DetailsPanel({
  isOpen,
  contact,
  isNew,
  defaultStage = 'Lead',
  openerEl,
  onSave,
  onClose
}: DetailsPanelProps) {
  const isDirtyRef = useRef(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Reset dirty ref whenever panel opens/closes or target contact changes
  useEffect(() => {
    isDirtyRef.current = false;
  }, [isOpen, contact?.id]);

  // Restore focus to opener element when closed
  useEffect(() => {
    if (!isOpen && openerEl) {
      openerEl.focus();
    }
  }, [isOpen, openerEl]);

  const handleRequestClose = (isDirty: boolean) => {
    if (isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    isDirtyRef.current = false;
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      handleRequestClose(isDirtyRef.current);
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    isDirtyRef.current = false;
    onClose();
  };

  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
        <Dialog.Portal>
          <Dialog.Backdrop className="panel-backdrop" />

          <Dialog.Popup className="details-panel-popup">
            {isOpen && (
              <DrawerContent
                key={`${contact?.id ?? 'new'}-${isNew ? defaultStage : ''}`}
                contact={contact}
                isNew={isNew}
                defaultStage={defaultStage}
                onSave={onSave}
                onRequestClose={handleRequestClose}
                onCancel={() => handleRequestClose(isDirtyRef.current)}
                onDirtyChange={(dirty) => {
                  isDirtyRef.current = dirty;
                }}
              />
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Discard Unsaved Changes Confirmation Dialog */}
      <Dialog.Root open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-[1px] animate-in fade-in-50 duration-150" />
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Dialog.Popup className="bg-white rounded-xl border border-[#ebebe7] shadow-2xl max-w-sm w-full p-5 outline-none animate-in fade-in-50 zoom-in-95 duration-150">
              <div className="flex items-start gap-3.5 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#fef3c7] flex items-center justify-center text-[#d97706] shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <Dialog.Title className="text-sm font-semibold text-[#2e2e2a]">
                    Unsaved changes
                  </Dialog.Title>
                  <Dialog.Description className="text-xs text-[#787774] mt-1.5 leading-relaxed">
                    You have unsaved changes. Are you sure you want to discard them and close the panel?
                  </Dialog.Description>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#f1f1ee]">
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#55554e] hover:text-[#2e2e2a] hover:bg-[#f1f1ee] rounded-md transition-colors cursor-pointer"
                >
                  Keep editing
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDiscard}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#eb5757] hover:bg-[#d93838] rounded-md transition-colors cursor-pointer shadow-xs"
                >
                  Discard changes
                </button>
              </div>
            </Dialog.Popup>
          </div>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
