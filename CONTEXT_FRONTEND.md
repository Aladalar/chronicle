# Chronicle — Frontend Chat Context

Paste this at the start of any chat about Chronicle frontend work.

## Quick Links
- **Repo:** github.com/YOURUSER/chronicle (replace with actual URL)
- **Frontend code:** `dev/src/`
- **Backend spec (what API exists):** `dev/BACKEND_SPEC.md`

## What Is This
Chronicle is a self-hosted campaign management system for tabletop RPG.
Frontend: React 18 + Vite 6 + Zustand. Dark/light/HC theme system.
Font Awesome icons via `@fortawesome/react-fontawesome` (full `fas` bundle).
Vitest + Testing Library for tests.

## Current Frontend State

### Admin panel (built, working)
- **Shell:** Sidebar with collapsible nav tree. Theme switcher (dark/light/high-contrast).
- **Campaigns:** CRUD cards with active selection. `currentAge` field for era system.
- **Shared DBs:** 23 global ref tables in 6 groups (Foundation, Game Mechanics, World, Creatures & NPCs, Locations, Alchemy & Magic). Generic `RefTablePage` driven by schema definitions. Dedicated `TypesPage` with designation grouping + searchable FA icon picker.
- **Age system:** Entries tagged with era. State badges (Known/Forgotten/Lost/Undiscovered) computed from `entry.age - campaign.currentAge`.
- **Annotations:** 6 types for description fields — `@age:N{...}`, `@dm{...}`, `@link:table:id{label}`, `@extinct/destroyed/forgotten{...}`, `@quote:Author{...}`, `@danger{...}`. Parsed at render time, preview toggle in edit modal.
- **Soundboard:** 3 libraries (sounds/music/ambient) + scene presets + live mixer with crossfade. Music is singleton. All tracks have loop/delay/fade/volume.
- **Ref Edits:** Proposal inbox — filter by status, approve/reject with reason.
- **Players:** Member list, invite generation with optional character pairing.

### Not built yet
- Player view (character sheet, game session UI)
- Campaign-scoped content (Lore & Journal pages)
- Character management in admin
- Actual audio playback (Web Audio API) — mixer is UI-only state management
- Socket.IO real-time sync on frontend

## Architecture

### API client (`src/api/client.js`)
Simple fetch wrapper. `api(method, path, body)`. Token stored in localStorage.
Console helper: `window.chronicle.loginAsDM(user, pass)`.

### Schema-driven tables (`src/pages/admin/refs/schema.js`)
Every ref table defined as `{ group, label, fields: [...], listColumns: [...], hasAge? }`.
Field types: text, longtext, number, select, tags, ref (FK dropdown with designation filter), color, attrmods, ingredient-parts, bundle-layers.
`RefTablePage` renders any table from its schema. `TypesPage` is a custom override for the types table.

### Icons (`src/components/icons.js`)
Central registry mapping section/table/action keys to FA icon objects.
`IconPicker` component — searchable grid of all FA free-solid icons with default inheritance from parent designation.
`StoredIcon` component — renders an icon from its stored name string.

### Annotations (`src/components/annotations/`)
`parser.js` — recursive descent parser, returns token tree.
`AnnotatedText.jsx` — renders tokens with age gating, DM visibility, cross-links, status badges, quotes, danger callouts.

### Themes (`src/styles/theme.css`)
Three themes as CSS variable sets, switched via `data-theme` on `<html>`.
Variables: `--bg`, `--surface`, `--surface-2`, `--border`, `--accent`, `--text`, `--text-dim`, `--text-mut`, `--red`, `--green`, `--blue`, `--purple`, plus shadows.

## File Structure
```
dev/src/
├── App.jsx                          # Top-level routing
├── api/client.js                    # Fetch wrapper
├── components/
│   ├── icons.js                     # FA icon registry
│   ├── IconPicker.jsx               # Searchable icon grid modal
│   ├── annotations/                 # Parser + renderer + styles
│   ├── Modal.jsx, Toast.jsx, ConfirmDialog.jsx, ThemeSwitcher.jsx
├── pages/admin/
│   ├── AdminShell.jsx + .module.css # Layout shell + nav tree
│   ├── CampaignsPage.jsx            # Campaign CRUD
│   ├── PlayersPage.jsx              # Invites + members
│   ├── RefEditsPage.jsx             # Proposal inbox
│   ├── Placeholder.jsx              # Stub for unbuilt sections
│   ├── refs/
│   │   ├── schema.js                # 23 table definitions
│   │   ├── age.js                   # Age state computation
│   │   ├── RefIndex.jsx             # Group picker landing
│   │   ├── RefTablePage.jsx         # Generic CRUD table
│   │   ├── TypesPage.jsx            # Types with designation groups
│   │   ├── FieldInput.jsx           # 10 field type renderers
│   ├── sounds/
│   │   ├── soundSchema.js           # Library + preset definitions
│   │   ├── SoundIndex.jsx           # Hub
│   │   ├── SoundLibrary.jsx         # Library CRUD
│   │   ├── PresetEditor.jsx         # Scene builder
│   │   ├── LiveMixer.jsx            # Playback controls
├── styles/theme.css                 # 3 theme variable sets
├── test/                            # 10 test files, ~100 tests
```

## Conventions
- CSS Modules for component styles (`.module.css`)
- CSS variables for all colors/spacing — never hardcode
- Font sizes: minimum 13px. User has eye impairment.
- All interactive cards have hover state with border-color transition
- Breadcrumb bar on drill-down pages with prominent back button
- Toast notifications for success/error via `toast.ok()` / `toast.error()`
- FA icons everywhere — no unicode glyphs

## Testing
```bash
npm test          # run all
npm run test:watch  # watch mode
```

## My Preferences
Short, strict, to the point. No emoticons. No unnecessary code dumps. High contrast, readable.
