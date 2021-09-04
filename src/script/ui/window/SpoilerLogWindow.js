
// frameworks
import Template from "/emcJS/util/html/Template.js";
import FileSystem from "/emcJS/util/FileSystem.js";
import SettingsBuilder from "/emcJS/util/SettingsBuilder.js";
import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import "/emcJS/ui/Paging.js";

// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import AbstractSettingsWindow from "/GameTrackerJS/ui/window/settings/AbstractSettingsWindow.js";
import BusyIndicator from "/GameTrackerJS/ui/BusyIndicator.js";
import Language from "/GameTrackerJS/util/Language.js";
// Track-OOT
import SpoilerOptionsResource from "/script/resource/SpoilerOptionsResource.js";
import SpoilerParser from "/script/util/spoilerparser/SpoilerParser.js";

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

export default class SpoilerLogWindow extends AbstractSettingsWindow {

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
        this.addEventListener("submit", async (event) => {
            await BusyIndicator.busy();
            SavestateHandler.set("parseSpoiler", event.data);
            if (!!spoiler && !!spoiler.data) {
                try {
                    const data = await SpoilerParser.parse(spoiler.data, event.data);
                    if (data != null) {
                        SavestateHandler.overwrite(data);
                    }
                    Language.applyLabel(loadSpoilerButton, "load-spoiler-button");
                    spoiler = {};
                    await BusyIndicator.unbusy();
                } catch(err) {
                    await BusyIndicator.unbusy();
                    await Dialog.alert("Error loading spoiler", err.message);
                }
            }
        });
    }

    show() {
        const options = SpoilerOptionsResource.get();
        const res = {};
        for (const i in options) {
            const opt = options[i];
            if (opt.type === "list") {
                const def = new Set(opt.default);
                for (const el of opt.values) {
                    res[el] = SavestateHandler.get("parseSpoiler", el, def.has(el));
                }
            } else {
                res[i] = SavestateHandler.get("parseSpoiler", i, opt.default);
            }
        }
        super.show(res);
    }

}

customElements.define("tootr-window-spoilerlog", SpoilerLogWindow);
