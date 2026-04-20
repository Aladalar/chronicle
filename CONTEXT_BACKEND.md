# Chronicle — Backend Chat Context

Paste this at the start of any chat about Chronicle backend work.

## Quick Links
- **Repo:** github.com/YOURUSER/chronicle (replace with actual URL)
- **Key files:** `lab/src/` (backend), `dev/src/` (frontend)
- **Backend spec:** `dev/BACKEND_SPEC.md` or `dev/src/BACKEND_SPEC.md`
- **API test script:** `dev/test-api.sh`

## What Is This
Chronicle is a self-hosted campaign management system for tabletop RPG.
Backend: Node.js 24 + Express + TypeORM + MariaDB 11.8 + Socket.IO.
Server: Arch Linux. Dev on `lab.chronicle.cz:3002`, prod on `api.chronicle.cz:3001`.

## Current Backend State (what exists)
- Auth: login, register via invite code, /me, reset-password. JWT with 7-day expiry.
- Campaigns: list, create, get single, generate invite, list members.
- Characters: full CRUD + stepper (delta-safe) + 7 sub-resource factories (abilities, knowledge, inventory, traits, arcane, tasks, attributes).
- Campaign-scoped refs: 8 tables via `campaignCrudFactory` at `/campaigns/:cid/refs/*`.
- Campaign content: journal, lore, ingredients (with parts child table), transmutations, runes.
- Socket.IO: rooms per campaign, every write broadcasts delta events.
- Two factory patterns: `campaignCrudFactory.ts` (CRUD for campaign-scoped entity) and `charSubFactory.ts` (CRUD for character sub-resources with ownership check).

## What Needs Building (priority order)

### 1. `globalCrudFactory` (new pattern)
Same as `campaignCrudFactory` but WITHOUT campaign_id filtering. Used for all global ref tables. Write once, mount 27 times.

### 2. Global ref tables — 23 total
Move existing 8 ref tables from campaign-scoped to global (remove campaign_id). Add 15 new tables. All use `globalCrudFactory`. See BACKEND_SPEC.md for full column definitions.

Tables: types, item-templates, abilities, knowledge, traits, ranks, races, items, beasts, flora, materials, monsters, npc-important, gods, npc-other, settlements, wonders, ruins, dungeons, spells, tomes, transmutations, runes.

Key: `types` table has `designations` JSON array controlling which systems each type appears in. Other tables reference types via FK.

Age-enabled tables (races, items, beasts, flora, materials, monsters, npc-important, gods, npc-other, settlements, wonders, ruins, dungeons, spells, tomes, transmutations, runes) have an `age INT` column — plain integer, not a date.

### 3. Campaign updates
- Add `current_age INT DEFAULT 1` to campaigns table.
- Add `PATCH /campaigns/:id` (DM only).
- Add `DELETE /campaigns/:id` with cascade.

### 4. Invite additions
- `GET /campaigns/:cid/invites` — query campaign_members where invite_claimed=false.
- `DELETE /invites/:code` — revoke unclaimed invite.

### 5. Sound tables — 4 new
sound_effects, sound_music, sound_ambient (identical schemas: name, path, tags JSON, volume, loop, loop_delay, fade_in, fade_out, notes). Plus sound_presets (name, tags JSON, fade_in/out_duration, music_track JSON, ambient_layers JSON, sound_buttons JSON, notes). All via `globalCrudFactory` under `/sounds/*`.

### 6. Proposals table
New table + 4 routes for player commit/DM approval flow. Most complex — the approve route must apply the proposed change to the target ref table. See BACKEND_SPEC.md for full spec.

### 7. User permissions (future)
Add permission columns to users table: perm_shared_mechanics, perm_shared_catalog, perm_shared_alchemy, perm_campaign_lore (each ENUM none/commit/edit), perm_characters (ENUM own/all).

## File Structure
```
/var/www/chronicle/
├── lab/                  # Dev backend (PORT=3002)
│   ├── src/
│   │   ├── index.ts
│   │   ├── data-source.ts
│   │   ├── entities/     # TypeORM entities
│   │   ├── routes/       # Express routers
│   │   ├── middleware/    # auth, campaignScope, errorHandler
│   │   ├── services/     # campaignCrudFactory, charSubFactory
│   │   ├── socket/       # emitter.ts
│   │   └── scripts/      # setup.ts
│   └── .env
├── dev/                  # Dev frontend (React + Vite)
│   ├── src/
│   ├── test-api.sh
│   └── BACKEND_SPEC.md   # ← FULL ENDPOINT SPEC, READ THIS FIRST
└── controls/             # Helper scripts
```

## Conventions
- UUID primary keys everywhere (`@PrimaryGeneratedColumn("uuid")`)
- created_at + updated_at on every table
- JSON columns use TypeORM `simple-json` or `json` type
- `synchronize: true` in dev, migrations for prod
- DM guard via middleware `requireRole("dm")`
- Socket events: `{prefix}:create/update/delete` with `_ts` timestamp

## Testing
After implementing routes, run from the dev directory:
```bash
./test-api.sh https://lab.chronicle.cz USERNAME PASSWORD
```
Green = pass, yellow = not yet implemented, red = broken.

## My Preferences
Short, strict, to the point. No emoticons. No unnecessary code dumps. TypeScript, CJS output. Match existing patterns.
