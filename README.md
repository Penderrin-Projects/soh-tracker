# SoH Rando Tracker

An auto-tracker for [Ship of Harkinian](https://www.shipofharkinian.com/) randomizer runs. Built on top of the excellent [Track-OOT](https://bitbucket.org/zidargs/track-oot) by [Denis Weiß (ZidArgs)](https://www.patreon.com/zidargs), with a thin integration layer that reads your SoH save file and updates the tracker in real time.

<img alt="SoH Rando Tracker" src="./docs/screenshot.png" width="720">

## What it does

- Watches your `Ship of Harkinian/Save/file1.sav`
- Auto-updates every check, item, and quest flag as you play
- Uses Track-OOT's complete UI: dungeon maps, overworld map, check list, logic engine, entrance tracker, hint tracker
- Adds an **Item Spoiler Lookup** window — stuck on what to find? Open the lookup, pick the item, click "Spoil It"

**Check coverage:** 335 / 336 vanilla randomizer checks auto-track. The single exception (Kak 100 Gold Skulltula Reward) can be marked manually — Track-OOT's location list only includes the 10-50 GS milestones.

## Requirements

- **Windows** (Linux/Mac untested; Electron should work but the launcher is Windows-only)
- **[Node.js 20+](https://nodejs.org)** — install before you run the tracker
- **Ship of Harkinian** with the randomizer feature (any recent version)

## Install

1. **Click "Code" → "Download ZIP"** on GitHub (or `git clone` if you prefer)
2. **Extract** anywhere (e.g. `C:\soh-tracker`)
3. **Double-click `START.bat`**

On first run, `START.bat` will:
- Install dependencies via `npm install` (3-5 minutes, one time)
- Build the app files into `dev/` (10 seconds)
- Launch the tracker

Subsequent runs just launch — no waiting.

## First-time setup inside the app

1. Click **File → Choose Save File** (or press `Ctrl+O`)
2. Browse to your SoH save file, typically at:
   ```
   C:\Users\<you>\Desktop\Ship of Harkinian\Save\file1.sav
   ```
   (or wherever SoH stores saves on your system)
3. That's it. Every time the save file changes, the tracker updates.

## Using it

The main tracker UI is Track-OOT's — see their [wiki](https://bitbucket.org/zidargs/track-oot/wiki) for full documentation. A few highlights:

- **Item & Map Tracker** — default view, dungeon maps with live check pins
- **Locationlist** — filterable list of every check
- **Maps** — overworld map with every check pin
- **Shops / Songs / Dungeonstate / Notes** — additional tabs
- **ITEM LOOKUP** (top nav) — the reverse spoiler lookup. Pick an item, click "Spoil It", see where it is.
- **RANDOMIZER OPTIONS** — adjust seed settings if they don't auto-populate
- **TRACKER SETTINGS** — customize colors, layouts, hotkeys

## Troubleshooting

**Tracker doesn't update when I collect something.** Make sure you picked the right save file (`Ctrl+O`). SoH only writes to the save file on game save (pause menu) or scene transition — updates aren't instant during gameplay.

**Tracker shows nothing.** Open the devtools (press `F12`) and check the Console tab. Look for lines starting with `[SohBridge]`. If you see a `[SohBridge] mapping loaded: 897 entries` line but no `applied:` lines, the save file path is probably wrong.

**I'm playing Master Quest.** MQ checks track partially. Vanilla is the focus for v1. Full MQ support is planned.

**I'm playing entrance randomizer.** Checks still track correctly, but the tracker's reachability logic won't know your entrance mappings until you load the spoiler log (Extras → Upload Spoiler).

**The `START.bat` says `npm: command not found`.** You need to install [Node.js](https://nodejs.org) first.

## Reporting bugs

Open an [issue](../../issues) with:
- What you were doing when the problem happened
- The relevant chunk of F12 console output
- Your SoH version and whether you're playing vanilla or MQ

A save file is incredibly helpful if you can share it (no personal data beyond your in-game name).

## Development

If you want to customize the tracker:

- **UI tweaks**: edit files in `src/` — this is Track-OOT's source. After editing, run `REBUILD-AND-START.bat` to refresh.
- **Bridge / auto-tracking logic**: edit files in `src/script/soh-bridge/` or `soh-integration/`
- **RC mappings**: `soh-integration/mappings/manual-overrides.json` is hand-editable
- **Upstream sync**: Track-OOT upstream is set as a git remote. To pull their updates:
  ```
  git fetch upstream
  git merge upstream/master
  ```

See `soh-integration/README.md` for the architecture deep-dive.

## Credits

- **[Track-OOT](https://bitbucket.org/zidargs/track-oot)** by Denis Weiß (ZidArgs) — the entire UI, maps, logic engine, and tracker core. MIT-licensed. This project is a fork that adds SoH auto-tracking.
- **[Ship of Harkinian](https://github.com/HarbourMasters/Shipwright)** — the randomizer data schema and save format
- **[OoT Randomizer](https://github.com/OoTRandomizer/OoT-Randomizer)** — the original PC randomizer whose logic Track-OOT implements

## License

MIT — see `LICENSE`. Original Track-OOT copyright preserved; SoH integration layer added under the same license.
