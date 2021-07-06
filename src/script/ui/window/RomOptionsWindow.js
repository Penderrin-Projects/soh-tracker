/* asym-import: off */
import Template from "/emcJS/util/Template.js";
/* asym-import: on */

// GameTrackerJS
import SavestateOptionsWindow from "/GameTrackerJS/ui/window/settings/SavestateOptionsWindow.js";
import Language from "/GameTrackerJS/util/Language.js";
// Track-OOT
import RulesetsResource from "/script/resource/RulesetsResource.js";

const LOAD_RULESET = new Template(`
    <div id="options-preset-wrapper">
        <select id="select-options-preset" class="settings-input" type="input"></select>
        <button id="load-options-preset" class="settings-button" type="button" value="undefined" style="margin-right: 10px;"></button>
    </div>
`);

export default class RomOptionsWindow extends SavestateOptionsWindow {

    constructor() {
        super() ;
        /* --- */
        
        // add preset choice
        const loadRulesetRow = LOAD_RULESET.generate();
        const loadRulesetWrapper = loadRulesetRow.getElementById("options-preset-wrapper");
        loadRulesetWrapper.style.display = "flex";
        loadRulesetWrapper.style.flex = "1";
        const loadRulesetButton = loadRulesetRow.getElementById("load-options-preset");
        Language.applyLabel(loadRulesetButton, "load-preset-button");
        
        const selector = loadRulesetRow.getElementById("select-options-preset");
        selector.style.width = "20%";
        const allRulesets = Object.keys(RulesetsResource.get());
        for (const value of allRulesets) {
            const opt = document.createElement("option");
            opt.value = value;
            opt.innerHTML = value;
            selector.append(opt);
        }

        loadRulesetButton.addEventListener("click", () => {
            const name = this.shadowRoot.getElementById("select-options-preset").value;
            
            const ruleset = RulesetsResource.get(name);
            const items = {};
            const options = {};
            if (!ruleset) { return }

            if (ruleset.items != null) {
                for (const key in ruleset.items) {
                    const value = ruleset.items[key];
                    items[key] = value;
                }
            }
            if (ruleset.options != null) {
                for (const key in ruleset.options) {
                    const value = ruleset.options[key];
                    if (Array.isArray(value)) {
                        for (const ref of value) {
                            options[ref] = true;
                        }
                    } else {
                        options[key] = value;
                    }
                }
            }

            this.overwriteValues(options);
        });

        this.shadowRoot.getElementById("footer").prepend(loadRulesetRow);
    }

    show() {
        super.show();
    }

}

customElements.define("tootr-window-romoptions", RomOptionsWindow);
