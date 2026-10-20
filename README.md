# Contact Directory: Table & Board Database Prototype

A standalone, high-fidelity frontend engineering and design prototype built with **React 19**, **TypeScript**, **Tailwind CSS**, and **Base UI** (`@base-ui/react`), inspired by Notion's database views.

This project implements a dual-view database (spreadsheet-like **Table View** and pipeline **Board View**) operating over a shared single-source-of-truth dataset, with seamless record editing, draft isolation, reactive stage color synchronization, and robust edge-case handling.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js**: v18+ recommended
- **npm**: v9+

### Installation & Run
```bash
# Clone the repository and install dependencies
npm install

# Start local Vite development server (runs on http://localhost:5173)
npm run dev

# Run type-checking and production build
npm run build

# Run linter
npm run lint
```

---

## 📋 Evaluation Criteria & Requirements Matrix

This prototype was crafted to address all 5 evaluation criteria from the design exercise:

| Requirement / Criterion | Implementation in Prototype | Status |
| :--- | :--- | :---: |
| **8–12 Fictional Contacts** | 12 diverse contacts in src/data/mockContacts.ts spanning 3 active stages, intentionally leaving the Customer stage empty on initial load | ✅ Complete |
| **Dual Synchronized Views** | Segmented **Table** & **Board** switcher; updates in either view instantly reflect in both | ✅ Complete |
| **4 Stage Groups** | `Lead`, `Prospect`, `Qualified`, and `Customer` | ✅ Complete |
| **8 Core Fields** | `Name`, `Email`, `Company`, `Role`, `Owner`, `Labels`, `Stage`, and `Notes` | ✅ Complete |
| **Clear Save & Cancel** | Slide-over drawer with **Draft Isolation Pattern** & **Unsaved Changes Dialog** | ✅ Complete |
| **Empty Board Column State** | Customer column loads empty (0 contacts) by default with an explicit empty-state placeholder; any stage emptied via edits or filters also renders this state | ✅ Complete |
| **Missing Data Fallback** | Monospace em-dashes (`—`) and `Unassigned` badges for sparse/optional fields | ✅ Complete |
| **Keyboard Accessibility** | `Enter`/`Space` to open, `Escape` to close, focus trapped in modals, focus returned to opener | ✅ Complete |
| **Narrower Desktop Layout** | Fluid edge-to-edge layout with responsive side gutters and horizontal overflow (`overflow-x-auto`) | ✅ Complete |

---

## 🎨 1. Visual Design & Layout Decisions

### Information Hierarchy & Field Allocation
Rather than displaying identical field density in all contexts, fields are strategically allocated according to user intent:

1. **Table View (High-Density Scanning)**:
   - Designed for rapid horizontal scanning across contacts.
   - Column order: `Aa Name`, `@ Email`, `💼 Role`, `⊙ Stage`, `🏢 Company`, `👤 Owner`.
   - **Page Icons**: Notion document page icons (`📄`) identify each record.
   - **Hover Actions**: Subtle `OPEN` button appears on row hover for quick inspection.
   - **Column Resizing**: Interactive column border drag handles with live width tooltips and double-click to reset to defaults.
   - **Trailing Actions**: Notion-styled trailing `+` (add property) and `...` columns with extending grid dividers.

2. **Board View (Pipeline Progression)**:
   - Grouped by pipeline stage (`Lead`, `Prospect`, `Qualified`, `Customer`).
   - Cards display: Contact Name, Role & Company, Notion pastel Label tags, multi-line Note preview, and Owner (with `<UserCheck>` icon).
   - Column headers feature contact count aggregation badges, column color tinting, and column-level `+ New` triggers.
   - Empty column states render an illustrated placeholder indicating the stage is clear.

3. **Details Panel (Deep Inspection & Editing)**:
   - Dedicated slide-over panel powered by accessible dialog primitives.
   - Displays all 8 properties with full editing controls:
     - Real-time stage picker with color swatch indicators.
     - Dynamic tag manager with custom color palette selection.
     - Multi-line notes textarea.
     - Metadata audit stamps (Created date).

### Notion-Inspired Aesthetics
- **Full-Width Edge-to-Edge Layout**: Replaced rigid container boxes with Notion's authentic responsive edge gutters (`w-full px-6 sm:px-10 lg:px-12`), allowing the table and board to naturally expand across wide screens.
- **Color Palette**: Curated pastel hues for tags and stages rather than harsh primary colors, maintaining readability in high-density tables.
- **Micro-Animations**: Smooth transitions on card hover, dropdown portals, and dialog transitions.

---

## ⚡ 2. Interaction Design & Workflow

### View Switching Without State Loss
- Switching between Table and Board views preserves:
  - Active search queries
  - Stage filters
  - Sort selections (`Name`, `Company`, `Stage`)
  - Scroll positions and record drafts

### Draft Isolation Pattern (Safe Editing)
To prevent accidental record mutation while typing:
1. Opening a contact creates a clone (`draft: ContactDraft`) isolated from the global state.
2. Editing inputs in the details panel only alters the local draft.
3. The panel displays live status: `• Unsaved changes` or `✓ All changes saved`.
4. Clicking **Save changes** validates inputs, applies updates to the single-source-of-truth state, triggers an auto-dismissing toast notification, and closes the panel.
5. Clicking **Cancel** discards the draft without modifying the database.

### Unsaved Changes Protection Modal
- If a user has uncommitted changes and attempts to dismiss the drawer (via Cancel button, backdrop click, or pressing `Escape`), an **Unsaved Changes Confirmation Dialog** intercepts the action:
  - **Discard changes**: Discards the local draft and closes the drawer.
  - **Keep editing**: Retains the drawer state and returns focus to the editor.

### Context Preservation & Focus Return
- When the details panel opens, it remembers the HTML element that opened it (`openerEl: HTMLElement`).
- When the panel closes, it programmatically restores keyboard focus directly to that table row or board card, allowing seamless keyboard-driven workflows.

---

## 🏗️ 3. Frontend Implementation & State Architecture

### Component Hierarchy
```text
src/
├── components/
│   ├── Header.tsx                 # Full-width Notion title & subtitle
│   ├── DatabaseToolbar.tsx        # View tabs, search, filter, sort & New buttons
│   ├── Subtoolbar.tsx             # Active filter chips, record counter & reset triggers
│   ├── TableView.tsx              # Resizable Notion grid with page icons & horizontal overflow
│   ├── BoardView.tsx              # 4 Kanban stage columns with cards & aggregation controls
│   ├── DetailsPanel.tsx           # Base UI Dialog slide-over drawer with draft isolation
│   └── ui/
│       ├── PropertyVisibilityPopover.tsx # Notion flyout popover for property show/hide & search
│       ├── ColumnColorMenu.tsx    # Board column menu: aggregation toggle & Move to Trash
│       ├── StageSelect.tsx        # Stage dropdown with fixed color swatch previews
│       ├── UnsavedChangesDialog.tsx # Modal dialog intercepting unsaved dismissals
│       └── InitialsAvatar.tsx     # Clean initials fallback avatar
├── data/
│   └── mockContacts.ts            # Initial 12-contact dataset & draft factories
├── types/
│   └── contact.ts                 # TypeScript interfaces, stage definitions & label registry
├── utils/
│   ├── boardColors.ts             # Reactive stage theme engine & localStorage persistence
│   ├── propertyVisibilityStore.ts # Reactive column visibility store with localStorage sync
│   ├── labelStore.ts              # Custom label & swatch manager
│   └── ownerStore.ts              # Team owner registry
├── App.tsx                        # Central state container, search/sort engine, toast system
└── index.css                      # Design tokens, scrollbar styling & Base UI animations
```

### Shared Single-Source-of-Truth
- State is held in `App.tsx` (`contacts: Contact[]`).
- Modifying a stage from the details drawer updates the record globally; the card instantly animates to its new column in the Board view, and the Stage pill updates in the Table view.

### Notion-Style Property Visibility (`src/components/ui/PropertyVisibilityPopover.tsx`)
- Clicking the toolbar's **Show or hide properties** button opens an authentic Notion flyout popover:
  - **Live Search**: Instant filtering of properties via `"Search for a property..."`.
  - **Shown in view**: Lists active properties with 6-dot drag handles, Notion type icons, and eye toggle buttons (`Eye`), with a quick `"Hide all"` action.
  - **Hidden in view**: Lists inactive properties (including `Labels` and `Notes`) with slashed eye toggle buttons (`EyeOff`) and a quick `"Show all"` action.
  - **Dynamic Columns**: Displays or hides columns in real time across the Table view and respects visible fields on Board cards.
  - **Persistence**: Saved in `localStorage` (`contact_property_visibility`) across page reloads.

### Fixed Canonical Stage Colors (`src/utils/boardColors.ts`)
- Each stage has a single, fixed Notion-pastel color theme — no user customization needed:
  - **Lead** → Gray, **Prospect** → Yellow, **Qualified** → Green, **Customer** → Blue
- `getStageTheme(stage)` resolves directly from `DEFAULT_STAGE_COLORS` (no localStorage lookup).
- Stage pills in the Table view, Board column headers, Details panel, and Stage selector all render with consistent, authoritative per-stage colors.

### Show / Hide Aggregation Counts
- Each board column menu includes a functional **Show aggregation** / **Hide aggregation** toggle.
- Preferences are saved in `localStorage` (`notion_board_show_aggregation_v1`), allowing users to toggle column count badges on or off.

---

## 🛡️ 4. Robustness & Accessibility

- **Missing Data Handling**: Contacts with missing optional properties (e.g. no Email, no Role, or no Company) gracefully display a monospace em-dash (`—`), preventing ragged layouts or blank cells.
- **Empty Column Handling**: When all contacts in a stage are moved elsewhere or filtered out, the column renders an illustrated empty state drop target rather than collapsing.
- **Keyboard Navigation**:
  - `Tab` / `Shift+Tab`: Full navigation through rows, buttons, and inputs.
  - `Enter` / `Space`: Activates table rows and board cards to open the details panel.
  - `Escape`: Closes open dropdowns, popovers, and slide-over panels safely.
  - Accessible focus trapping in modals powered by `@base-ui/react`.
- **Responsive Overflow**:
  - Table view employs `overflow-x-auto` with styled scrollbars, ensuring that even on narrower 1024px or 1280px laptop screens, all columns remain accessible without breaking the layout.

---

## 💡 5. Reasoning, Trade-offs & Next Steps

### Key Decisions & Rationale
1. **Why Base UI Dialog instead of custom portals?**
   Base UI handles ARIA dialog roles, focus trapping, body scroll locking, and backdrop portaling out of the box, ensuring compliance with accessibility standards without bloated dependencies.
2. **Why Draft Isolation instead of instant live-editing?**
   In database tools, live keystroke mutation in slide-over panels can cause premature sorting jumps (e.g., if sorting by Name or Stage while typing). The draft pattern ensures changes only take effect upon deliberate confirmation.
3. **Why Native CSS Grid/Table over ag-Grid or TanStack Table?**
   For a dataset of this scale (10–100 records), an external heavy table library adds unnecessary bundle weight. A bespoke CSS table with column resize refs keeps bundle size under 35 kB of CSS while matching Notion's exact visual specifications.

### Trade-offs Accepted (Within 3–4 Hour Timebox)
- **Drag-and-Drop**: Omitted heavy third-party drag-and-drop libraries (e.g. `@dnd-kit` or `react-beautiful-dnd`) to prioritize rock-solid keyboard navigation, touch support, and state synchronization within the time limit. Moving cards is accomplished cleanly via the Stage selector in the details panel or card controls.
- **Client-Side Persistence**: Used React state and `localStorage` rather than a mock backend API, adhering to the prompt's instruction that no backend, login, or database is required.

### What Could Be Built Next
- **Drag-and-Drop Reordering**: Integrate `@dnd-kit` for fluid card dragging between Kanban columns and row reordering in the table.
- **Column Visibility Customizer**: Implement the Notion "Property visibility" popover submenu to allow users to toggle columns on and off dynamically.
- **Inline Table Cell Editing**: Double-click or single-click inline editing directly inside table cells.
- **Undo / Redo History**: Add an undo stack (Command pattern) to effortlessly revert accidental changes.
- **CSV Import / Export**: Allow exporting the contact database to CSV or importing external contacts.

---

## 🧪 Validation & Testing

```bash
# Verify TypeScript compilation and production build
npm run build

# Run Oxlint for static analysis
npm run lint
```
*Current test status: 0 errors, 0 warnings.*
