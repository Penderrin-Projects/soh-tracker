# SoH Integration Layer

This layer wraps [Track-OOT](https://bitbucket.org/zidargs/track-oot) (MIT, Copyright © 2025 Denis Weiß/ZidArgs) inside an Electron shell and drives it from a Ship of Harkinian save file instead of manual clicks or Archipelago sync.

## Why

Track-OOT already has every feature we need:
- 12 consolidated dungeon maps with exact check positions
- Full overworld map with zone/grotto pins
- Complete OoTR logic engine (reachability, trick support, MQ handling)
- Item tracker, check tracker, hint tracker, entrance tracker
- Settings, filters, layout customization

What we add: a thin bridge that reads SoH's `file1.sav`, parses check status + inventory, and pushes values into Track-OOT's observable storage. Everything in Track-OOT's UI then updates automatically via its existing observer pattern.

## Architecture

```
C:\...\Ship of Harkinian\Save\file1.sav
       │
       │ chokidar file watcher (75ms debounce)
       ▼
┌──────────────────────────────────────┐
│ Electron main process (Node.js)      │
│  ─────────────────────────────────── │
│  • electron/main.js                  │
│  • electron/save-parser.js           │
│    parses SoH .sav JSON →            │
│      { items, checks, flags }        │
└──────────────────────────────────────┘
       │ IPC ("soh:state-update")
       ▼
┌──────────────────────────────────────┐
│ Electron renderer (Track-OOT webapp) │
│  ─────────────────────────────────── │
│  src/script/soh-bridge/SohBridge.js  │
│    receives state, translates RCs,   │
│    calls Savestate.getStorage("...") │
│                                      │
│  [Track-OOT UI — unmodified]         │
│    observes storage changes,         │
│    updates maps/trackers/logic       │
└──────────────────────────────────────┘
```

## Folder layout

```
/
├── src/                         Track-OOT source (fork, MIT)
│   └── script/
│       └── soh-bridge/          OUR additions live here
│           ├── SohBridge.js     Main bridge module
│           ├── RcMapper.js      SoH RC → Track-OOT location translator
│           └── ItemMapper.js    SoH inventory → Track-OOT item translator
│
├── soh-integration/             OUR integration code (outside Track-OOT)
│   ├── electron/
│   │   ├── main.js              Electron main process
│   │   ├── preload.js           Context bridge for IPC
│   │   └── save-parser.js       SoH .sav JSON parser
│   ├── mappings/
│   │   ├── soh-rc-to-trackoot.json    Auto+manual RC mapping
│   │   ├── manual-overrides.json      Hand-corrected mappings
│   │   └── soh-item-to-trackoot.json  Item mapping (items + upgrades)
│   └── docs/
│       └── save-format.md       Notes on SoH save JSON structure
│
├── logic/                       Track-OOT's pre-built logic rules (MIT)
├── node_modules/                dependencies
└── dev/                         Assembled app for serving (gitignored)
```

## What data we pull from the save file

From `sections.base.data`:
- `inventory.items[]` — B-button slot items (ids 0-23)
- `inventory.equipment` — sword/shield/tunic/boots bitfield
- `inventory.upgrades` — wallet/quiver/strength/scale bitfield
- `inventory.questItems` — songs/medallions/stones bitfield
- `inventory.ammo[]` — bomb/arrow/seed/chu/nut/stick counts
- `inventory.dungeonItems[]` — map/compass/boss key per dungeon
- `inventory.dungeonKeys[]` — small key counts per dungeon
- `inventory.gsTokens` — total gold skulltula tokens
- `savedSceneNum` — current scene ID

From `sections.randomizer.data`:
- `masterQuestDungeons` — which dungeons are MQ (vanilla-only project ignores these)
- `requiredTrials` — which Ganon's Castle trials are active
- `randoSettings` — seed settings
- `entrances` — entrance randomizer mappings
- `itemLocations` — (spoiler-like) what item is at each RC

From `sections.trackerData.data`:
- **`checkStatus[]`** — **this is the critical one.** Array of `{randomizerCheck, skipped, status}`. status=5 means collected.
- `areasSpoiled` — which areas SoH has spoiled via hints

## Check status values (from SoH `randomizer_check_tracker.h`)
- 0 = None
- 1 = Unchecked (SoH knows about it but not reached)
- 2 = Seen (player has walked past, maybe peeked via Lens)
- 3 = Hinted (gossip stone mentioned it)
- 4 = Skipped (player manually skipped in tracker)
- 5 = Checked (collected) ← **what we push to Track-OOT**

## Scope

**Vanilla randomizer is the primary goal.** MQ and Master Quest are not supported initially. Boss Hearts (RC 401, 426, 487, etc.) are deliberately unmapped because Track-OOT combines them with the boss check itself.

## Coverage

As of current mapping (see `soh-integration/mappings/soh-rc-to-trackoot.json`):
- **271/272 classic vanilla rando checks** map successfully to Track-OOT
- 1 intentional unmap: Kak 100 Gold Skulltula Reward (Track-OOT only tracks 10-50 GS rewards)

## Customization

Every piece of this is editable source. To change something:

- **UI tweaks** → edit `src/` files (Track-OOT source); re-run `yarn buildDev` to refresh `dev/`
- **Mapping fixes** → edit `soh-integration/mappings/manual-overrides.json`; regenerate with the mapping-build script
- **Save parser changes** → edit `soh-integration/electron/save-parser.js`; restart Electron
- **New bridge behavior** → edit `src/script/soh-bridge/*.js`

## Upstream updates

Track-OOT lives on its own branch. We can pull upstream changes from bitbucket with:
```
git fetch upstream
git merge upstream/master
```
Conflicts should be rare since our code is in separate folders.
