/**
 * SohBridge — main integration module.
 *
 * This runs in the Track-OOT renderer. It:
 *   1. Waits for Track-OOT's Savestate system to be ready.
 *   2. Loads the RC -> Track-OOT location mapping.
 *   3. Subscribes to SoH state updates pushed by the Electron main process.
 *   4. On each update, translates the SoH save state into Track-OOT storage
 *      updates for "items" and "locations".
 *   5. Optionally translates MQ-dungeon flags into "dungeonTypes" storage.
 *
 * Track-OOT's existing observers then propagate changes through the UI
 * automatically - no changes to Track-OOT's render code are required.
 */

import Savestate from "/GameTrackerJS/savestate/Savestate.js";
import { loadMapping, buildLocationsUpdate, getMappingSize } from "./RcMapper.js";
import { buildItemsUpdate } from "./ItemMapper.js";

// Dungeon-index -> Track-OOT dungeon area name.
// Used to translate SoH's `masterQuestDungeons` into Track-OOT's
// "dungeonTypes" storage so the maps switch between vanilla and MQ
// layouts automatically.
const DUNGEON_TYPE_KEYS = {
    0:  "deku",
    1:  "dodongo",
    2:  "jabujabu",
    3:  "temple_forest",
    4:  "temple_fire",
    5:  "temple_water",
    6:  "temple_spirit",
    7:  "temple_shadow",
    8:  "well",
    9:  "ice_cavern",
    10: "castle_ganon",       // ganons tower
    11: "training_grounds",
    13: "castle_ganon",
};

class SohBridge {

    #itemStore;
    #locationStore;
    #dungeonTypeStore;

    #unsubStateUpdate = null;
    #unsubWatchError = null;
    #unsubPickSave = null;

    #lastState = null;
    #initialized = false;

    async init() {
        if (this.#initialized) return;
        this.#initialized = true;

        console.log("[SohBridge] initializing...");

        // --- Resolve Track-OOT storage handles. These are registered by
        // Savestate's constructor (items, locations) and by
        // registerStorages.js (dungeonTypes).
        this.#itemStore = Savestate.getStorage("items");
        this.#locationStore = Savestate.getStorage("locations");
        try {
            this.#dungeonTypeStore = Savestate.getStorage("dungeonTypes");
        } catch (e) {
            this.#dungeonTypeStore = null;
        }

        // --- Load SoH RC -> Track-OOT location mapping
        await loadMapping();
        console.log(`[SohBridge] mapping loaded: ${getMappingSize()} entries`);

        // --- Check bridge API is present (set by preload)
        if (!globalThis.sohTracker) {
            console.warn(
                "[SohBridge] window.sohTracker missing. Is this running in Electron?"
            );
            return;
        }

        // --- Pull any state that was cached before we subscribed
        try {
            const lastState = await globalThis.sohTracker.getLastState();
            if (lastState) this.applyState(lastState);
        } catch (e) {
            console.error("[SohBridge] getLastState failed:", e);
        }

        // --- Subscribe to live state updates
        this.#unsubStateUpdate = globalThis.sohTracker.onStateUpdate((state) => {
            this.applyState(state);
        });

        // --- Handle watch errors (file missing etc.)
        this.#unsubWatchError = globalThis.sohTracker.onWatchError((err) => {
            console.warn("[SohBridge] watcher error:", err);
        });

        // --- Wire Ctrl+O / menu "Choose Save..."
        this.#unsubPickSave = globalThis.sohTracker.onTriggerPickSave(async () => {
            try {
                await globalThis.sohTracker.pickSaveFile();
            } catch (e) {
                console.error("[SohBridge] pick failed:", e);
            }
        });

        // --- If we don't have a configured save path, prompt once
        try {
            const prefs = await globalThis.sohTracker.getPrefs();
            if (!prefs || !prefs.savePath) {
                console.log("[SohBridge] no save path set - user needs to choose one via File menu");
            }
        } catch (e) {}

        console.log("[SohBridge] ready");
    }

    /**
     * Apply a parsed SoH state to Track-OOT storage.
     *
     * This fires whenever the save file changes. We rebuild the full items
     * and locations update from scratch each time - the storage is
     * idempotent, so unchanged values produce no events.
     */
    applyState(state) {
        if (!state) return;
        this.#lastState = state;

        try {
            // --- Items
            const itemsUpdate = buildItemsUpdate(state);
            this.#itemStore.setAll(itemsUpdate);

            // --- Locations (check status)
            const locationsUpdate = buildLocationsUpdate(state.checkStatus || []);
            this.#locationStore.setAll(locationsUpdate);

            // --- Dungeon types (vanilla vs master quest)
            if (this.#dungeonTypeStore) {
                const dtUpdate = this.#buildDungeonTypes(state);
                if (Object.keys(dtUpdate).length > 0) {
                    this.#dungeonTypeStore.setAll(dtUpdate);
                }
            }

            console.log(
                `[SohBridge] applied: ${Object.keys(itemsUpdate).length} items, ` +
                `${Object.keys(locationsUpdate).length} locations ` +
                `(${Object.values(locationsUpdate).filter(Boolean).length} checked)`
            );
        } catch (err) {
            console.error("[SohBridge] applyState failed:", err);
        }
    }

    #buildDungeonTypes(state) {
        const mq = state?.rando?.masterQuestDungeons;
        if (!Array.isArray(mq) || mq.length === 0) return {};

        const out = {};
        // SoH's masterQuestDungeons is an array of dungeon indices flagged MQ.
        // We need to set dungeonTypes[<to-area>] = "mq" | "v" for each known dungeon.
        // First set all dungeons to vanilla, then flip flagged ones to MQ.
        for (const [idx, name] of Object.entries(DUNGEON_TYPE_KEYS)) {
            if (!(name in out)) out[name] = "v";
        }
        for (const idx of mq) {
            const name = DUNGEON_TYPE_KEYS[idx];
            if (name) out[name] = "mq";
        }
        return out;
    }

    /** Last state applied - handy for debugging from console */
    get lastState() {
        return this.#lastState;
    }

    destroy() {
        this.#unsubStateUpdate?.();
        this.#unsubWatchError?.();
        this.#unsubPickSave?.();
        this.#unsubStateUpdate = null;
        this.#unsubWatchError = null;
        this.#unsubPickSave = null;
        this.#initialized = false;
    }
}

const bridge = new SohBridge();

// Expose for debugging from devtools console
globalThis.__sohBridge = bridge;

export default bridge;
