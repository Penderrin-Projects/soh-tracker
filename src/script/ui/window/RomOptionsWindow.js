// frameworks
import Template from "/emcJS/util/html/Template.js";

// GameTrackerJS
import OptionsResource from "/GameTrackerJS/resource/OptionsResource.js";
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
            if (!ruleset) {
                return
            }

            if (ruleset.items != null) {
                for (const key in ruleset.items) {
                    const value = ruleset.items[key];
                    items[key] = value;
                }
            }

            const optionsData = OptionsResource.get();
            for (const key in optionsData) {
                const oData = optionsData[key];
                if (oData.type == "list") {
                    const list = ruleset.options?.[key];
                    if (list != null) {
                        for (const name of oData.values) {
                            options[name] = ruleset.options?.[name] ?? list.includes(name);
                        }
                    } else {
                        for (const name of oData.values) {
                            options[name] = ruleset.options?.[name] ?? oData.default.includes(name);
                        }
                    }
                } else {
                    options[key] = ruleset.options?.[key] ?? oData.default;
                }
            }

            this.overwriteValues(options);
            this.overwriteItems(items);
        });

        this.shadowRoot.getElementById("footer").prepend(loadRulesetRow);
    }

}

customElements.define("tootr-window-romoptions", RomOptionsWindow);
