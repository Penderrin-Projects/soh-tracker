/**
 * CustomColorWindow — lets the user override Track-OOT's gold theme color.
 * Persistence is handled by the Electron main process (prefs.json): on
 * every HTTP serve of an HTML file, the main process injects a <style>
 * block overriding :root vars. That means the color survives restarts
 * and is applied BEFORE any JS runs (no flash, nothing to race).
 *
 * This file is only responsible for the picker UI and live-apply while
 * the app is running.
 */

import Window from "/emcJS/ui/overlay/window/Window.js";
import HTMLTemplate from "/emcJS/util/html/template/HTMLTemplate.js";
import CSSTemplate from "/emcJS/util/html/template/CSSTemplate.js";

const DEFAULT_COLOR = "#cb9c3d";

// Must match THEME_COLOR_VARS in soh-integration/electron/main.js
const COLOR_VARS = [
    "--navigation-back-color",
    "--modal-header-back-color",
    "--modal-footer-back-color",
    "--tabpanel-categories-border-color",
    "--contextmenu-text-color",
    "--contextmenu-border-color",
    "--button-active-back-color",
];

// Must match THEME_ALPHA_VARS in soh-integration/electron/main.js
const ALPHA_VARS = [
    { name: "--page-hover-back-color",        alpha: "5c" },
    { name: "--main-hover-color",             alpha: "32" },
    { name: "--contextmenu-hover-back-color", alpha: "32" },
];

/**
 * Update or remove the <style id="soh-custom-color-override"> element
 * in the current document. Called live while the user adjusts the picker.
 * On the next restart, the main process handles this injection directly.
 */
function applyColorLive(hex) {
    let styleEl = document.getElementById("soh-custom-color-override");
    if (!hex || hex.toLowerCase() === DEFAULT_COLOR.toLowerCase()) {
        if (styleEl) styleEl.remove();
        return;
    }
    if (!styleEl) {
        styleEl = document.createElement("style");
        styleEl.id = "soh-custom-color-override";
        document.documentElement.appendChild(styleEl);
    }
    const lines = [":root {"];
    for (const v of COLOR_VARS) lines.push(`  ${v}: ${hex} !important;`);
    for (const { name, alpha } of ALPHA_VARS) lines.push(`  ${name}: ${hex}${alpha} !important;`);
    lines.push("}");
    styleEl.textContent = lines.join("\n");
}

const TPL = new HTMLTemplate(`
<div id="cc-root">
    <div class="intro">
        Pick a custom background/accent color for the tracker.<br>
        Default is the original gold. Click <b>Reset</b> to return to it.
    </div>
    <div class="row">
        <label for="cc-picker">Color:</label>
        <input id="cc-picker" type="color" value="#cb9c3d" />
        <input id="cc-text" type="text" value="#cb9c3d" spellcheck="false" />
    </div>
    <div class="row">
        <button id="cc-apply"  class="btn primary">Apply</button>
        <button id="cc-reset"  class="btn">Reset to default</button>
    </div>
    <div id="cc-status" class="status"></div>
</div>
`);

const STYLE = new CSSTemplate(`
#body { min-width: 320px; }
#cc-root {
    padding: 14px 18px;
    display: flex; flex-direction: column; gap: 12px;
    color: #eee; font-size: 14px;
}
.intro { color: #bbb; }
.row { display: flex; align-items: center; gap: 10px; }
label { min-width: 50px; font-weight: bold; }
#cc-picker { width: 56px; height: 34px; padding: 0; border: 1px solid #555; background: #2a2a2a; cursor: pointer; }
#cc-text {
    flex: 1; padding: 6px 8px; background: #2a2a2a;
    border: 1px solid #555; border-radius: 3px; color: #eee;
    font-family: monospace; font-size: 14px;
}
.btn {
    padding: 8px 14px; border: 0; border-radius: 3px;
    background: #555; color: #ddd; cursor: pointer; font-weight: bold; font-size: 14px;
}
.btn.primary { background: #cb9c3d; color: #222; }
.btn:hover { filter: brightness(1.15); }
.status { font-size: 12px; color: #888; min-height: 1em; }
`);

export default class CustomColorWindow extends Window {
    #pickerEl; #textEl; #statusEl;

    constructor() {
        super("Custom Color");
        const els = TPL.generate();
        STYLE.apply(this.shadowRoot);
        const body = this.shadowRoot.getElementById("body");
        body.innerHTML = "";
        body.append(els);

        this.#pickerEl = this.shadowRoot.getElementById("cc-picker");
        this.#textEl   = this.shadowRoot.getElementById("cc-text");
        this.#statusEl = this.shadowRoot.getElementById("cc-status");

        // Sync picker <-> text
        this.#pickerEl.addEventListener("input", () => {
            this.#textEl.value = this.#pickerEl.value;
        });
        this.#textEl.addEventListener("input", () => {
            const v = this.#textEl.value.trim();
            if (/^#[0-9a-fA-F]{6}$/.test(v)) this.#pickerEl.value = v;
        });

        this.shadowRoot.getElementById("cc-apply").addEventListener("click", () => this.#apply());
        this.shadowRoot.getElementById("cc-reset").addEventListener("click", () => this.#reset());
    }

    async show() {
        // Preload current color from main-process prefs
        let current = DEFAULT_COLOR;
        try {
            const saved = await globalThis.sohTracker?.getCustomColor?.();
            if (saved) current = saved;
        } catch (_) { /* ignore */ }
        this.#pickerEl.value = current;
        this.#textEl.value = current;
        this.#statusEl.textContent = "";
        if (super.show) super.show();
        else this.setAttribute("shown", "");
    }

    async #apply() {
        const v = this.#textEl.value.trim();
        if (!/^#[0-9a-fA-F]{6}$/.test(v)) {
            this.#statusEl.textContent = "Invalid color. Use format #RRGGBB.";
            this.#statusEl.style.color = "#f88";
            return;
        }
        applyColorLive(v);
        try {
            await globalThis.sohTracker?.setCustomColor?.(v);
            this.#statusEl.textContent = "Applied. Will persist across restarts.";
            this.#statusEl.style.color = "#8f8";
        } catch (err) {
            this.#statusEl.textContent = "Applied (not persisted): " + (err?.message || err);
            this.#statusEl.style.color = "#fc8";
        }
    }

    async #reset() {
        applyColorLive(DEFAULT_COLOR);
        try {
            await globalThis.sohTracker?.setCustomColor?.(null);
        } catch (_) { /* ignore */ }
        this.#pickerEl.value = DEFAULT_COLOR;
        this.#textEl.value = DEFAULT_COLOR;
        this.#statusEl.textContent = "Reset to default.";
        this.#statusEl.style.color = "#8f8";
    }
}

customElements.define("soh-custom-color-window", CustomColorWindow);
