# Chronicle — General Chat Context

Paste this at the start of any chat about Chronicle design, architecture, or planning.

## Quick Links
- **Repo:** github.com/YOURUSER/chronicle (replace with actual URL)
- **Frontend:** `dev/src/` (React 18 + Vite 6)
- **Backend:** `lab/src/` (Node.js 24 + Express + TypeORM + MariaDB)

## What Is This
Chronicle is a self-hosted campaign management system for a tabletop RPG group running a custom homebrew system. Not D&D — custom 9-attribute system with transmutation circles, rune circuits, alchemy, arcane elements, etc.

## Game System Basics
- 9 attributes: STR, END, FOR, AGI, INT, WIS, SPI, CHA, LCK
- Abilities ranked Novice → Grandmaster, progress 0-10 per rank
- Knowledge linked to arcane elements
- Transmutation circles with function notation (ERAM, CIRCUM, CREO...)
- Rune system: cyclic circuits (Input → Capacitor → Circuit → Discharge → Ground)
- Souls = energy/mana, Minor/Major = currency
- Companions as mini character sheets

## Architecture
- Single server: nginx → Node.js backend + static SPA
- 5 domains: chronicle.cz (landing), app/api (prod), dev/lab (dev)
- JWT auth with UUID invite codes
- Socket.IO for real-time sync (rooms per campaign)
- TypeORM with synchronize=true in dev, migrations for prod

## Key Design Decisions
1. **Global vs Campaign:** Reference tables (types, abilities, races, monsters, etc.) are GLOBAL. Campaign content (journal, lore, characters) is campaign-scoped.
2. **Types system:** One master enum table with `designations` JSON controlling which systems each type appears in. Everything references Types.
3. **Age/Era system:** Campaigns have a `currentAge` integer. World entries have an `age` field. State (known/forgotten/lost/undiscovered) computed from the difference.
4. **Annotations:** Description fields support inline markup: `@age:N{...}`, `@dm{...}`, `@link:table:id{label}`, `@extinct{...}`, `@quote:Author{...}`, `@danger{...}`.
5. **Soundboard:** Libraries (sounds/music/ambient) + scene presets with layered audio. Music is singleton with crossfade. All tracks have loop/delay/fade controls.
6. **Permissions (planned):** Per-player permission groups — sharedMechanics/sharedCatalog/sharedAlchemy (none/commit/edit), campaignLore (none/commit/edit), characters (own/all). Commit = propose for DM review.
7. **Theme system:** 3 themes (dark/light/high-contrast) via CSS variables. User has eye impairment — minimum 13px fonts, high contrast required.

## What's Built
- Admin panel: campaigns, 23 shared DB tables, types editor, soundboard, ref edits inbox, players/invites
- Backend: auth, campaigns, characters with sub-resources, campaign-scoped refs + content, socket.IO

## What's Not Built Yet
- Player-facing character sheet view
- Campaign-scoped Lore & Journal admin pages
- Character management in admin
- Audio playback engine (Web Audio API)
- User permission enforcement
- Landing page

## Players
3 active players: Kuba (Gort, Uraaki warrior), Ponta (Dardanos, Child of Water mage), Erhart (Erhart Romulus, Child of Forest ranger).

## My Preferences
Short, strict, to the point. No emoticons. No unnecessary code dumps. Pragmatic over perfect. Design should be high contrast, readable, simple with contrast.
