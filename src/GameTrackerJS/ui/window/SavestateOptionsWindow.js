
import Template from "/emcJS/util/Template.js";
import EventBus from "/emcJS/event/EventBus.js";
import FileData from "/emcJS/data/FileData.js";

import OptionsStorage from "../../storage/OptionsStorage.js";
import SettingsBuilder from "../../util/SettingsBuilder.js";
import Language from "../../util/Language.js";
import SettingsWindow from "./SettingsWindow.js";

import BusyIndicator from "/script/ui/BusyIndicator.js";

BusyIndicator.setIndicator(document.getElementById("busy-animation"));

const LOAD_RULESET = new Template(`
    <div id="options-preset-wrapper">
        <select id="select-options-preset" class="settings-input" type="input"></select>
        <button id="load-options-preset" class="settings-button" type="button" value="undefined" style="margin-right: 10px;"></button>
    </div>
`);

export default class SavestateOptionsWindow extends SettingsWindow {

    constructor() {
        super() ;
        /* --- */
        const options = FileData.get("options");
        SettingsBuilder.build(this, options);
        /* --- */
        this.addEventListener("submit", function(event) {
            BusyIndicator.busy();
            const settings = event.data;
            OptionsStorage.setAll(settings);
            EventBus.trigger("randomizer_options", settings);
            BusyIndicator.unbusy();
        });
        
        // add preset choice
        const loadRulesetRow = LOAD_RULESET.generate();
        const loadRulesetWrapper = loadRulesetRow.getElementById("options-preset-wrapper");
        loadRulesetWrapper.style.display = "flex";
        loadRulesetWrapper.style.flex = "1";
        const loadRulesetButton = loadRulesetRow.getElementById("load-options-preset");
        loadRulesetButton.innerHTML = Language.translate("load-preset-button");
        
        const selector = loadRulesetRow.getElementById("select-options-preset");
        selector.style.width = "20%";
        const allRulesets = Object.keys(FileData.get("rulesets"));
        for (const value of allRulesets) {
            const opt = document.createElement("option");
            opt.value = value;
            opt.innerHTML = value;
            selector.append(opt);
        }

        loadRulesetButton.addEventListener("click", () => {
            const name = this.shadowRoot.getElementById("select-options-preset").value;
            
            const ruleset = FileData.get("rulesets")[name];
            const items = {};
            if (!ruleset) { return }

            for (const i in ruleset) {
                let panel = null;
                if (i !== "items") panel = this.shadowRoot.querySelector(`.panel[data-ref="${i}"]`);
                for (const j in ruleset[i]) {
                    if (i === "items") {
                        items[j] = ruleset[i][j];
                    } else {
                        const opt = panel.querySelector(`[data-ref="${j}"]`);
                        if (opt != null) {
                            if (opt.type === "checkbox") {
                                opt.checked = ruleset[i][j];
                            } else {
                                opt.value = ruleset[i][j];
                            }
                        }
                    }
                }
            }
        });

        this.shadowRoot.getElementById("footer").prepend(loadRulesetRow)
    }

    show() {
        const values = OptionsStorage.getAll();
        super.show(values);
    }

}

customElements.define("gt-window-savestateoptions", SavestateOptionsWindow);
