
/* asym-import: off */
import Template from "/emcJS/util/Template.js";
import FileSystem from "/emcJS/util/FileSystem.js";
import "/emcJS/ui/Paging.js";
/* asym-import: on */

// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import BusyIndicator from "/GameTrackerJS/ui/BusyIndicator.js";
import SettingsBuilder from "/GameTrackerJS/util/SettingsBuilder.js";
import Language from "/GameTrackerJS/util/Language.js";
import SettingsWindow from "/GameTrackerJS/ui/window/settings/SettingsWindow.js";
// Track-OOT
import SpoilerOptionsResource from "/script/resource/SpoilerOptionsResource.js";
import SpoilerParser from "/script/util/SpoilerParser.js";

let spoiler = {};

const LOAD_SPOILER = new Template(`
    <div id="options-spoiler-wrapper">
        <button id="load-spoiler-preset" class="settings-button" type="button" value="undefined" style="margin-right: 10px;"></button>
    </div>
`);

async function loadSpoiler(button) {
    spoiler = await FileSystem.load(".json");
    if (!!spoiler && !!spoiler.data) {
        Language.applyLabel(button, "loaded-spoiler-button");
    }
}

export default class SpoilerLogWindow extends SettingsWindow {

    constructor() {
        super("Spoiler parser");
        /* --- */
        const options = SpoilerOptionsResource.get();
        SettingsBuilder.build(this, options);
        
        // add preset choice
        const loadSpoilerRow = LOAD_SPOILER.generate();
        const loadSpoilerWrapper = loadSpoilerRow.getElementById("options-spoiler-wrapper");
        loadSpoilerWrapper.style.display = "flex";
        loadSpoilerWrapper.style.flex = "1";
        const loadSpoilerButton = loadSpoilerRow.getElementById("load-spoiler-preset");
        Language.applyLabel(loadSpoilerButton, "load-spoiler-button");


        loadSpoilerButton.addEventListener("click", () => {
            loadSpoiler(loadSpoilerButton);
        });

        this.shadowRoot.getElementById("footer").prepend(loadSpoilerRow);
        /* --- */
        this.addEventListener("submit", function(event) {
            BusyIndicator.busy();
            const options = SpoilerOptionsResource.get();
            const settingsData = {};
            for (const i in event.data) {
                for (const j in event.data[i]) {
                    let v = event.data[i][j];
                    if (Array.isArray(v)) {
                        v = new Set(v);
                        options[i][j].values.forEach(el => {
                            SavestateHandler.set("parseSpoiler", el, v.has(el));
                            settingsData[el] = v.has(el);
                        });
                    } else {
                        SavestateHandler.set("parseSpoiler", j, v);
                        settingsData[j] = v;
                    }
                }
            }
            if (!!spoiler && !!spoiler.data) {
                SpoilerParser.parse(spoiler.data, settingsData);
                Language.applyLabel(loadSpoilerButton, "load-spoiler-button");
                spoiler = {};
            }
            BusyIndicator.unbusy();
        });
    }

    show() {
        const options = SpoilerOptionsResource.get();
        const res = {};
        for (const i in options) {
            res[i] = res[i] || {};
            for (const j in options[i]) {
                const opt = options[i][j];
                if (opt.type === "list") {
                    const def = new Set(opt.default);
                    const val = [];
                    for (const el of opt.values) {
                        if (SavestateHandler.set("parseSpoiler", el, def.has(el))) {
                            val.push(el);
                        }
                    }
                    res[i][j] = val;
                } else {
                    res[i][j] = SavestateHandler.set("parseSpoiler", j, opt.default);
                }
            }
        }
        super.show(res);
    }

}

customElements.define("tootr-window-spoilerlog", SpoilerLogWindow);
