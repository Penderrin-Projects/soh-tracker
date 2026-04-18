/**
 * SpoilerLookupWindow - "Where is X?" reverse-lookup modal.
 *
 * Opens a small dialog with:
 *   - A search / filter textbox
 *   - A dropdown of progression-relevant items (swords, songs, medallions,
 *     trade items, progressive upgrades, etc.)
 *   - A "Spoil It" button that reveals the location text on demand
 *
 * Data source: Ship of Harkinian save file's
 * `sections.randomizer.data.itemLocations` array, which is already cached by
 * SohBridge after each save-file update. An RG -> item-name mapping lives in
 * /soh-integration/mappings/rg-id-to-name.json, and the SoH-RC display-name
 * mapping lives on the bridge.
 */

// frameworks
import Window from "/emcJS/ui/overlay/window/Window.js";
import HTMLTemplate from "/emcJS/util/html/template/HTMLTemplate.js";
import CSSTemplate from "/emcJS/util/html/template/CSSTemplate.js";

const TPL = new HTMLTemplate(`
<div id="spoiler-lookup">
    <div class="intro">
        Look up where an item is in your current seed.
        <br>
        Pick an item and click <b>Spoil It</b> to reveal its location.
    </div>
    <div class="controls">
        <label for="sp-filter">Filter:</label>
        <input id="sp-filter" type="text" placeholder="type to search..." autocomplete="off" />
    </div>
    <div class="controls">
        <label for="sp-item">Item:</label>
        <select id="sp-item"></select>
    </div>
    <div class="controls">
        <button id="sp-spoil" class="action">Spoil It</button>
        <button id="sp-hide"  class="action secondary">Hide</button>
    </div>
    <div id="sp-result" class="result hidden"></div>
    <div id="sp-status" class="status"></div>
</div>
`);

const STYLE = new CSSTemplate(`
#body {
    min-width: 380px;
    max-width: 560px;
}
#spoiler-lookup {
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-size: 14px;
    line-height: 1.4;
    color: #eee;
}
.intro {
    color: #bbb;
    font-style: italic;
}
.controls {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
}
.controls label {
    min-width: 52px;
    font-weight: bold;
}
#sp-filter, #sp-item {
    flex: 1;
    padding: 6px 8px;
    background: #2a2a2a;
    border: 1px solid #555;
    border-radius: 3px;
    color: #eee;
    font-size: 14px;
}
#sp-item {
    min-height: 32px;
}
button.action {
    padding: 8px 14px;
    background: #cb9c3d;
    color: #222;
    border: 0;
    border-radius: 3px;
    font-weight: bold;
    cursor: pointer;
    font-size: 14px;
}
button.action:hover { background: #ddad4e; }
button.action.secondary {
    background: #555;
    color: #ddd;
}
button.action.secondary:hover { background: #666; }
.result {
    padding: 10px 14px;
    background: #2a2a2a;
    border-left: 3px solid #cb9c3d;
    border-radius: 2px;
    font-size: 15px;
}
.result.hidden { display: none; }
.result .item-name {
    font-weight: bold;
    color: #cb9c3d;
}
.result .location-name {
    display: block;
    margin-top: 6px;
    color: #fff;
}
.result .multi-note {
    display: block;
    margin-top: 6px;
    color: #888;
    font-size: 12px;
    font-style: italic;
}
.status {
    font-size: 12px;
    color: #888;
    min-height: 1em;
}
`);

/** Cached RG metadata: rgID -> {rgName, display, progression} */
let rgDb = null;
/** Cached SoH RC display names: rcId -> "Deku Tree Map Chest" */
let rcDb = null;
/** The last itemLocations array seen from the save file. */
let lastItemLocations = null;

/**
 * Load RG + RC databases the first time the window is opened.
 * Falls back to empty data gracefully if either fetch fails.
 */
async function ensureDatabases() {
    const tasks = [];

    if (!rgDb) {
        tasks.push(
            fetch("/soh-integration/mappings/rg-id-to-name.json")
                .then((r) => r.ok ? r.json() : null)
                .then((data) => { rgDb = data || { items: {} }; })
                .catch(() => { rgDb = { items: {} }; })
        );
    }

    if (!rcDb) {
        tasks.push(
            fetch("/soh-integration/mappings/soh-rc-db.json")
                .then((r) => r.ok ? r.json() : null)
                .then((data) => { rcDb = data || {}; })
                .catch(() => { rcDb = {}; })
        );
    }

    await Promise.all(tasks);
}

/**
 * Build the list of items present in the current seed for which we should
 * show an entry. Uses the "progression" flag from rgDb.
 *
 * @returns {Array<{rgId:number, display:string, locations:number[]}>}
 */
function buildItemList() {
    if (!rgDb || !lastItemLocations) return [];

    // Aggregate: for each progression rgID, collect all RC ids where it appears
    const byRg = new Map();

    for (let rcId = 0; rcId < lastItemLocations.length; rcId++) {
        const entry = lastItemLocations[rcId];
        if (!entry) continue;
        const rg = entry.rgID;
        if (rg == null || rg === 0) continue; // 0 = RG_NONE
        const info = rgDb.items?.[String(rg)];
        if (!info || !info.progression) continue;

        if (!byRg.has(rg)) byRg.set(rg, { rgId: rg, display: info.display, locations: [] });
        byRg.get(rg).locations.push(rcId);
    }

    // Sort alphabetically by display name
    return Array.from(byRg.values()).sort((a, b) => a.display.localeCompare(b.display));
}

function rcToLocationName(rcId) {
    // Our soh-rc-db.json keys RC ids as strings and values include displayName.
    // We may have the full object or a partial projection; handle both.
    const rec = rcDb?.[String(rcId)];
    if (!rec) return `RC ${rcId}`;
    return rec.displayName || rec.display || rec.name || `RC ${rcId}`;
}

export default class SpoilerLookupWindow extends Window {

    #itemsEl;
    #filterEl;
    #resultEl;
    #statusEl;
    #spoilBtn;
    #hideBtn;
    #currentItems = [];

    constructor() {
        super("Item Spoiler Lookup");
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        const body = this.shadowRoot.getElementById("body");
        body.innerHTML = "";
        body.append(els);

        this.#itemsEl  = this.shadowRoot.getElementById("sp-item");
        this.#filterEl = this.shadowRoot.getElementById("sp-filter");
        this.#resultEl = this.shadowRoot.getElementById("sp-result");
        this.#statusEl = this.shadowRoot.getElementById("sp-status");
        this.#spoilBtn = this.shadowRoot.getElementById("sp-spoil");
        this.#hideBtn  = this.shadowRoot.getElementById("sp-hide");

        this.#filterEl.addEventListener("input", () => this.#applyFilter());
        this.#spoilBtn.addEventListener("click", () => this.#revealLocation());
        this.#hideBtn.addEventListener("click", () => this.#hideResult());
        this.#itemsEl.addEventListener("change", () => this.#hideResult());
    }

    /**
     * Show the window. Pulls latest itemLocations from the bridge and rebuilds
     * the dropdown each time, so it reflects the current save state.
     */
    async show() {
        await ensureDatabases();

        // Pull latest save state cached on the bridge
        const bridge = globalThis.__sohBridge;
        const state = bridge?.lastState || await globalThis.sohTracker?.getLastState?.();
        lastItemLocations = state?.rando?.itemLocations || null;

        this.#currentItems = buildItemList();
        this.#renderOptions(this.#currentItems);
        this.#filterEl.value = "";
        this.#hideResult();
        this.#updateStatus();

        // Call the super's show (Window class)
        if (super.show) super.show();
        else this.setAttribute("shown", "");
    }

    #renderOptions(items) {
        this.#itemsEl.innerHTML = "";
        if (!items.length) {
            const opt = document.createElement("option");
            opt.textContent = "(no items found - load a save file)";
            opt.disabled = true;
            this.#itemsEl.append(opt);
            this.#spoilBtn.disabled = true;
            return;
        }
        this.#spoilBtn.disabled = false;
        for (const item of items) {
            const opt = document.createElement("option");
            opt.value = String(item.rgId);
            opt.textContent = item.display;
            this.#itemsEl.append(opt);
        }
    }

    #applyFilter() {
        const q = this.#filterEl.value.trim().toLowerCase();
        const filtered = q
            ? this.#currentItems.filter((i) => i.display.toLowerCase().includes(q))
            : this.#currentItems;
        this.#renderOptions(filtered);
        this.#hideResult();
    }

    #revealLocation() {
        const rgIdStr = this.#itemsEl.value;
        if (!rgIdStr) return;
        const item = this.#currentItems.find((i) => String(i.rgId) === rgIdStr);
        if (!item) return;

        const locs = item.locations.map(rcToLocationName);
        const html = locs.length === 1
            ? `<span class="item-name">${escapeHtml(item.display)}</span> is at:
               <span class="location-name">${escapeHtml(locs[0])}</span>`
            : `<span class="item-name">${escapeHtml(item.display)}</span> is at:
               <span class="location-name">${locs.map(escapeHtml).join("<br>")}</span>
               <span class="multi-note">${locs.length} copies of this item exist in the seed</span>`;
        this.#resultEl.innerHTML = html;
        this.#resultEl.classList.remove("hidden");
    }

    #hideResult() {
        this.#resultEl.classList.add("hidden");
        this.#resultEl.innerHTML = "";
    }

    #updateStatus() {
        if (!lastItemLocations) {
            this.#statusEl.textContent =
                "No save file loaded yet. Pick one via File menu.";
            return;
        }
        this.#statusEl.textContent =
            `${this.#currentItems.length} progression items found in current seed.`;
    }

}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

customElements.define("soh-spoiler-lookup-window", SpoilerLookupWindow);
