# Chronicle — Backend Spec for Admin Frontend

Generated from the admin frontend (step 12). This documents every API endpoint
the frontend calls, the expected request/response shapes, and the database
schema changes needed.

Your existing backend is at `lab.chronicle.cz`, Express + TypeORM + MariaDB.
Current routes are under `/api/v1`. Everything below follows that prefix.

---

## 1. EXISTING ROUTES (should already work)

### Auth
```
POST   /auth/login              { username, password }               → { token, user }
POST   /auth/register/:code     { username, password, displayName? } → { token, user, campaignId }
POST   /auth/reset-password     { userId, newPassword }              → OK (DM only)
GET    /auth/me                                                      → { id, username, displayName, role }
```

### Campaigns
```
GET    /campaigns                                                    → [ { id, name, description, currentAge?, createdBy } ]
POST   /campaigns               { name, description?, currentAge? }  → campaign object
GET    /campaigns/:id                                                → campaign detail + memberRole
POST   /campaigns/:id/invite    { role?, characterId? }              → { inviteCode, role }
GET    /campaigns/:id/members                                        → [ { id, userId, role, user: { username, displayName } } ]
```

### Characters (campaign-scoped, existing)
```
GET    /campaigns/:cid/characters                                    → [ character objects ]
```

---

## 2. NEW ROUTES NEEDED — Campaigns

### PATCH /campaigns/:id
Update campaign fields. DM only.
```
Request:  { name?, description?, currentAge? }
Response: updated campaign object
```
**Schema change:** Add `current_age INT DEFAULT 1` to `campaigns` table.

### DELETE /campaigns/:id
Delete campaign and all related data. DM only.
```
Response: 204 No Content
```

---

## 3. NEW ROUTES NEEDED — Global Reference Tables

**Architecture change:** Reference tables are now GLOBAL (no `campaign_id`).
The frontend calls `/api/v1/refs/:table` without a campaign scope.

If you want to keep backward compatibility with campaign-scoped refs,
add a separate router for global refs alongside the existing one.

### Generic CRUD for each table

For each table key below, implement:
```
GET    /refs/:table              → [ all rows ]
GET    /refs/:table/:id          → single row
POST   /refs/:table              → create (DM only), returns created row
PATCH  /refs/:table/:id          → update (DM only), returns updated row
DELETE /refs/:table/:id          → delete (DM only), returns 204
```

### Table keys and their fields

**types** — Master enum
```
id            UUID PK
name          VARCHAR(100) NOT NULL
icon          VARCHAR(10)           -- user-set glyph (⚔, 🔥, etc.)
color         VARCHAR(7)            -- hex (#c04040)
designations  JSON                  -- ["ability","rarity","spell",...]
sort_order    INT
```
Designations control which dropdowns a type appears in.
Valid designations: ability, knowledge, spell, tome, arcane, trait, rarity,
item, material, monster, god, transmutation, rune, currency, damage

**item-templates**
```
id            UUID PK
name          VARCHAR(200) NOT NULL
description   TEXT
attributes    VARCHAR(200)          -- "STR+2, AGI+1"
rarity_id     UUID FK → types      -- filtered by designation 'rarity'
type_id       UUID FK → types      -- filtered by designation 'item'
```

**abilities**
```
id            UUID PK
name          VARCHAR(200) NOT NULL
type_id       UUID FK → types      -- filtered by designation 'ability'
attribute     VARCHAR(10)           -- STR, END, FOR, AGI, INT, WIS, SPI, CHA, LCK
description   TEXT
```

**knowledge**
```
id            UUID PK
name          VARCHAR(200) NOT NULL
type_id       UUID FK → types      -- filtered by designation 'knowledge'
description   TEXT
```

**traits**
```
id            UUID PK
name          VARCHAR(200) NOT NULL
description   TEXT
default_mods  JSON                  -- {"STR": -2, "AGI": 1}
type_id       UUID FK → types      -- filtered by designation 'trait'
```

**ranks**
```
id            UUID PK
name          VARCHAR(100) NOT NULL
tier_order    INT NOT NULL
progress_cap  INT NOT NULL
```

**races** (has age)
```
id            UUID PK
name          VARCHAR(200) NOT NULL
age           INT                   -- era of origin
description   TEXT
```

**items** (has age)
```
id            UUID PK
name          VARCHAR(200) NOT NULL
template_id   UUID FK → item-templates  (nullable)
age           INT
description   TEXT
attributes    VARCHAR(200)
rarity_id     UUID FK → types
type_id       UUID FK → types
```

**beasts** (has age)
```
id            UUID PK
name          VARCHAR(200) NOT NULL
age           INT
habitat       VARCHAR(200)
threat_level  VARCHAR(50)           -- Harmless/Low/Moderate/High/Lethal
description   TEXT
```

**flora** (has age)
```
id            UUID PK
name          VARCHAR(200) NOT NULL
age           INT
biome         VARCHAR(200)
description   TEXT
```

**materials** (has age, replaces old ingredients)
```
id            UUID PK
name          VARCHAR(200) NOT NULL
age           INT
type_id       UUID FK → types      -- filtered by designation 'material'
biome         VARCHAR(200)
occurrence    VARCHAR(200)
location      VARCHAR(200)
parts         JSON                  -- [{ part, effect, power }]
```
Or keep `ingredient_parts` child table — frontend sends/receives `parts` as JSON array either way.

**monsters** (has age)
```
id            UUID PK
name          VARCHAR(200) NOT NULL
age           INT
type_id       UUID FK → types      -- filtered by designation 'monster'
threat_level  VARCHAR(50)           -- Low/Moderate/High/Deadly/Apocalyptic
description   TEXT
```

**npc-important** (has age)
```
id            UUID PK
name          VARCHAR(200) NOT NULL
age           INT
race_id       UUID FK → races      (nullable)
role          VARCHAR(200)
affiliation   VARCHAR(200)
description   TEXT
```

**gods** (has age)
```
id            UUID PK
name          VARCHAR(200) NOT NULL
age           INT
domain        VARCHAR(200)
type_id       UUID FK → types      -- filtered by designation 'god'
description   TEXT
```

**npc-other** (has age)
```
id            UUID PK
name          VARCHAR(200) NOT NULL
age           INT
race_id       UUID FK → races      (nullable)
role          VARCHAR(200)
notes         TEXT
```

**settlements** (has age)
```
id            UUID PK
name          VARCHAR(200) NOT NULL
age           INT
population    INT
governance    VARCHAR(200)
description   TEXT
```

**wonders** (has age)
```
id            UUID PK
name          VARCHAR(200) NOT NULL
age           INT
kind          VARCHAR(200)
description   TEXT
```

**ruins** (has age)
```
id            UUID PK
name          VARCHAR(200) NOT NULL
age           INT
origin        VARCHAR(200)
description   TEXT
```

**dungeons** (has age)
```
id            UUID PK
name          VARCHAR(200) NOT NULL
age           INT
inhabitant    VARCHAR(200)
description   TEXT
```

**spells** (has age)
```
id            UUID PK
name          VARCHAR(200) NOT NULL
age           INT
type_id       UUID FK → types      -- designation 'spell'
arcane_id     UUID FK → types      -- designation 'arcane'
level         VARCHAR(20)
cost          VARCHAR(20)
description   TEXT
```

**tomes** (has age)
```
id            UUID PK
name          VARCHAR(200) NOT NULL
age           INT
source        VARCHAR(200)
type_id       UUID FK → types      -- designation 'tome'
description   TEXT
```

**transmutations** (has age)
```
id            UUID PK
name          VARCHAR(200) NOT NULL
age           INT
notation      VARCHAR(300)
description   TEXT
type          VARCHAR(50)           -- Mainframe/Funkce/Objekt
level         VARCHAR(20)
cost          VARCHAR(20)
```

**runes** (has age)
```
id            UUID PK
name          VARCHAR(200) NOT NULL
age           INT
effect        VARCHAR(200)
arcane        VARCHAR(100)
category      VARCHAR(50)           -- effect/logic/utility
description   TEXT
```

---

## 4. NEW ROUTES NEEDED — Proposals (Ref Edits)

Player commits for DM review. New table + routes.

### Table: proposals
```
id            UUID PK
author_id     UUID FK → users
table_name    VARCHAR(100)         -- which ref table
op            ENUM('create','update','delete')
target_id     UUID                 -- for update/delete, the row being changed (nullable for create)
data          JSON                 -- proposed row data
status        ENUM('pending','approved','rejected') DEFAULT 'pending'
reason        TEXT                 -- DM rejection reason (nullable)
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

### Routes
```
GET    /proposals                 → [ proposals ] — DM sees all, player sees own
                                    Query params: ?status=pending|approved|rejected
POST   /proposals                 { table, op, targetId?, data } → created proposal
POST   /proposals/:id/approve     → applies the change, sets status=approved
POST   /proposals/:id/reject      { reason? } → sets status=rejected
DELETE /proposals/:id             → author can withdraw own pending proposal
```

---

## 5. NEW ROUTES NEEDED — Invites

### GET /campaigns/:cid/invites
List pending (unclaimed) invites for a campaign. DM only.
```
Response: [ { inviteCode, role, characterId?, createdAt } ]
```
This data exists in `campaign_members` where `invite_claimed = false`.

### DELETE /invites/:code
Revoke an unclaimed invite. DM only.
```
Response: 204
```

---

## 6. NEW ROUTES NEEDED — Soundboard

### Tables

**sound_effects**
```
id            UUID PK
name          VARCHAR(200) NOT NULL
path          VARCHAR(500)         -- file path on server
tags          JSON                 -- ["combat","nature"]
volume        INT DEFAULT 80       -- 0-100
loop          VARCHAR(3)           -- "yes" or "no"
loop_delay    INT DEFAULT 0        -- seconds between loops
fade_in       FLOAT DEFAULT 0      -- seconds
fade_out      FLOAT DEFAULT 0      -- seconds
notes         TEXT
```

**sound_music** — same columns as sound_effects
**sound_ambient** — same columns as sound_effects

**sound_presets**
```
id              UUID PK
name            VARCHAR(200) NOT NULL
tags            JSON
fade_in_duration  FLOAT DEFAULT 2  -- scene transition fade in
fade_out_duration FLOAT DEFAULT 2  -- scene transition fade out
music_track     JSON               -- { trackName, volume, loop, loopDelay, fadeIn, fadeOut }
ambient_layers  JSON               -- [{ trackName, volume, loop, loopDelay, fadeIn, fadeOut }]
sound_buttons   JSON               -- [{ trackName, volume, loop, loopDelay, fadeIn, fadeOut }]
notes           TEXT
```

### Routes
For each library: `/sounds/sounds`, `/sounds/music`, `/sounds/ambient`
```
GET    /sounds/:category          → [ all rows ]
POST   /sounds/:category          → create, returns created
PATCH  /sounds/:category/:id      → update, returns updated
DELETE /sounds/:category/:id      → 204
```

For presets:
```
GET    /sounds/presets             → [ all presets ]
POST   /sounds/presets             → create
PATCH  /sounds/presets/:id         → update
DELETE /sounds/presets/:id         → 204
```

---

## 7. USER PERMISSIONS (future)

The frontend is prepared for per-user permission groups.
When you add these, the expected shape on the user object:

```
permissions: {
  sharedMechanics:  "none" | "commit" | "edit",
  sharedCatalog:    "none" | "commit" | "edit",
  sharedAlchemy:    "none" | "commit" | "edit",
  campaignLore:     "none" | "commit" | "edit",
  characters:       "own"  | "all",
}
```

Route to set:
```
PATCH  /users/:id/permissions     { sharedMechanics, sharedCatalog, ... } (DM only)
```

---

## 8. IMPLEMENTATION PRIORITY

Suggested order based on what unblocks frontend testing:

1. **PATCH/DELETE /campaigns/:id** + add `current_age` column — quick win, unblocks campaign editing
2. **Global /refs/:table CRUD** — use `campaignCrudFactory` pattern but without campaign scope. Start with `types`, then the rest. This is 22 tables but they're all the same shape.
3. **GET /campaigns/:cid/invites** + **DELETE /invites/:code** — query existing `campaign_members` table
4. **Sound tables + routes** — 3 library tables + 1 preset table, all simple CRUD
5. **Proposals table + routes** — most complex (apply logic on approve)
6. **User permissions fields** — add columns to users table, enforce in middleware

---

## 9. FACTORY PATTERN SUGGESTION

You already have `campaignCrudFactory`. For global refs, make a `globalCrudFactory`:

```typescript
function globalCrudRouter({ entity, eventPrefix, writeAccess = "dm" }) {
  const router = Router();
  // GET /        → find all
  // GET /:id     → findOne
  // POST /       → create (DM guard)
  // PATCH /:id   → update (DM guard)
  // DELETE /:id  → delete (DM guard)
  // Each write broadcasts socket event: `${eventPrefix}:create/update/delete`
  return router;
}
```

Then in routes/refs.ts:
```typescript
router.use("/types",           globalCrudRouter({ entity: RefType, eventPrefix: "ref:types" }));
router.use("/abilities",       globalCrudRouter({ entity: RefAbility, eventPrefix: "ref:abilities" }));
router.use("/beasts",          globalCrudRouter({ entity: Beast, eventPrefix: "ref:beasts" }));
// ... 22 total
```

Same for sounds:
```typescript
router.use("/sounds",          globalCrudRouter({ entity: SoundEffect, eventPrefix: "sound:effects" }));
router.use("/music",           globalCrudRouter({ entity: SoundMusic, eventPrefix: "sound:music" }));
router.use("/ambient",         globalCrudRouter({ entity: SoundAmbient, eventPrefix: "sound:ambient" }));
router.use("/presets",          globalCrudRouter({ entity: SoundPreset, eventPrefix: "sound:presets" }));
```
