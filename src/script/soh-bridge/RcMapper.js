/**
 * RcMapper - translates SoH RandomizerCheck IDs to Track-OOT location names.
 *
 * Consumes the generated mapping table at
 * /soh-integration/mappings/soh-rc-to-trackoot.json which is copied into
 * dev/ at build time as /soh-integration/mappings/soh-rc-to-trackoot.json.
 */

const MAPPING_URL = "/soh-integration/mappings/soh-rc-to-trackoot.json";

/** @type {Map<number, string>} */
let rcToTrackoot = new Map();

/** @type {Promise<void>|null} */
let loadPromise = null;

/**
 * Lazily load the mapping JSON and populate the Map. Safe to call many times.
 */
export function loadMapping() {
    if (loadPromise) return loadPromise;
    loadPromise = (async () => {
        try {
            const res = await fetch(MAPPING_URL);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            rcToTrackoot = new Map();
            for (const [rcStr, toId] of Object.entries(data.mapping || {})) {
                rcToTrackoot.set(Number(rcStr), toId);
            }
            console.log(`[RcMapper] loaded ${rcToTrackoot.size} SoH RC -> Track-OOT mappings`);
        } catch (err) {
            console.error("[RcMapper] Failed to load mapping:", err);
            rcToTrackoot = new Map();
        }
    })();
    return loadPromise;
}

/**
 * Convert a SoH RC ID to a Track-OOT location ID, or null if unmapped.
 * @param {number} rcId
 * @returns {string|null}
 */
export function rcToLocation(rcId) {
    return rcToTrackoot.get(rcId) ?? null;
}

/**
 * Convert a list of SoH check-status entries to a Track-OOT locations object
 * suitable for `Savestate.getStorage("locations").setAll(obj)`.
 *
 * status 5 = Checked (collected) -> true
 * all other statuses -> false (unchecked)
 *
 * Entries whose RC doesn't have a Track-OOT mapping are silently dropped.
 *
 * @param {Array<{randomizerCheck: number, skipped: boolean, status: number}>} checkStatus
 * @returns {Object<string, boolean>}
 */
export function buildLocationsUpdate(checkStatus) {
    const update = {};
    for (const entry of checkStatus) {
        const toId = rcToTrackoot.get(entry.randomizerCheck);
        if (!toId) continue;
        update[toId] = entry.status === 5;
    }
    return update;
}

/**
 * Debug helper.
 */
export function getMappingSize() {
    return rcToTrackoot.size;
}
