import Dialog from "/emcJS/ui/overlay/window/Dialog.js";
import IDBStorage from "/emcJS/data/storage/IDBStorage.js";
import SettingsObserver from "/GameTrackerJS/util/observer/SettingsObserver.js";
import OptionsObserver from "/GameTrackerJS/util/observer/OptionsObserver.js";
import LogicUIAbstractElement from "/editors/ui/logic/AbstractElement.js";
import LogicResource from "../../resource/LogicResource.js";
import LogicGlitchedResource from "../../resource/LogicGlitchedResource.js";

const logicRulesObserver = new OptionsObserver("logic_rules");
const customLogicObserver = new SettingsObserver("use_custom_logic");

class LogicViewer {

    async show(ref, title = ref) {
        const d = new Dialog({
            title: title,
            submit: "OK"
        });
        d.value = ref;
        const el = document.createElement("div");
        el.style.display = "flex";
        const result = await this.getLogic(ref);
        for (const {logic, parent} of result) {
            if (logic) {
                const c = document.createElement("div");
                c.style.padding = "5px";
                c.style.border = "1px #00000033";
                c.style.borderStyle = "none solid";
                if (parent) {
                    const p = document.createElement("button");
                    p.innerHTML = `From:<br>${parent}`;
                    p.addEventListener("click", () => {
                        d.close();
                        this.show(parent);
                    });
                    c.append(p);
                }
                const l = LogicUIAbstractElement.buildLogic(logic);
                l.readonly = true;
                c.append(l);
                el.append(c);
            }
        }
        d.append(el);
        d.show();
    }

    async getLogic(ref) {
        if (logicRulesObserver.value == "logic_rules_glitchless") {
            return this.#getNormalLogic(ref);
        }
        if (logicRulesObserver.value == "logic_rules_glitched") {
            return this.#getGlitchedLogic(ref);
        }
        return [];
    }

    async #getNormalLogic(ref) {
        const data = LogicResource.get();
        if (customLogicObserver.value) {
            const LogicsStorage = new IDBStorage("logics");
            const customData = await LogicsStorage.getAll();
            return this.extractLogic(ref, data, customData);
        } else {
            return this.extractLogic(ref, data);
        }
    }

    async #getGlitchedLogic(ref) {
        const data = LogicGlitchedResource.get();
        if (customLogicObserver.value) {
            const LogicsStorage = new IDBStorage("logics_glitched");
            const customData = await LogicsStorage.getAll();
            return this.extractLogic(ref, data, customData);
        } else {
            return this.extractLogic(ref, data);
        }
    }

    extractLogic(ref, data = {}, customData = {}) {
        const res = [];
        for (const name in data.logic) {
            if (name == ref || name == `${ref}{child}` || name == `${ref}{adult}`) {
                if (customData[name] != null) {
                    res.push({logic: customData[name], parent: ""});
                } else {
                    res.push({logic: data.logic[name], parent: ""});
                }
            }
        }
        for (const region in data.edges) {
            for (const name in data.edges[region]) {
                if (name == ref || name == `${ref}{child}` || name == `${ref}{adult}`) {
                    const key = `${region} -> ${name}`;
                    if (customData[key] != null) {
                        res.push({logic: customData[key], parent: region});
                    } else {
                        res.push({logic: data.edges[region][name], parent: region});
                    }
                }
            }
        }
        return res;
    }

}

export default new LogicViewer();
