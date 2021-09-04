// frameworks
import SettingsWindow from "/emcJS/ui/overlay/window/settings/SettingsWindow.js";

import Language from "../../../util/Language.js";

const VARS = {
    "I18n.languages": Language.getLanguages
};

function convertValueList(values = {}) {
    const opt = {};
    if (typeof values == "string") {
        values = VARS[values]();
    }
    if (typeof values == "object") {
        if (Array.isArray(values)) {
            for (const key of values) {
                opt[key] = Language.generateLabel(key);
            }
        } else {
            for (const key in values) {
                if (values[key] != null) {
                    opt[key] = Language.generateLabel(values[key]);
                } else {
                    opt[key] = Language.generateLabel(key);
                }
            }
        }
    }
    return opt;
}

export default class AbstractSettingsWindow extends SettingsWindow {

    constructor(title = "Settings", options = {}) {
        super(Language.generateLabel(title), options.close);
    }

    getTab(category, label = category) {
        label = Language.generateLabel(label);
        return super.getTab(category, label);
    }

    addStringInput(category, label, ref, def, visible, resettable) {
        label = Language.generateLabel(label);
        super.addStringInput(category, label, ref, def, visible, resettable);
    }

    addNumberInput(category, label, ref, def, visible, resettable, min, max) {
        label = Language.generateLabel(label);
        super.addNumberInput(category, label, ref, def, visible, resettable, min, max);
    }

    addRangeInput(category, label, ref, def, visible, resettable, min, max) {
        label = Language.generateLabel(label);
        super.addRangeInput(category, label, ref, def, visible, resettable, min, max);
    }

    addCheckInput(category, label, ref, def, visible, resettable) {
        label = Language.generateLabel(label);
        super.addCheckInput(category, label, ref, def, visible, resettable);
    }

    addColorInput(category, label, ref, def, visible, resettable) {
        label = Language.generateLabel(label);
        super.addColorInput(category, label, ref, def, visible, resettable);
    }

    addChoiceInput(category, label, ref, def, visible, resettable, values) {
        label = Language.generateLabel(label);
        values = convertValueList(values);
        super.addChoiceInput(category, label, ref, def, visible, resettable, values);
    }

    addListSelectInput(category, label, ref, def, visible, resettable, multiple, values) {
        label = Language.generateLabel(label);
        values = convertValueList(values);
        super.addListSelectInput(category, label, ref, def, visible, resettable, multiple, values);
    }

    addButton(category, label, ref, visible, text = "", callback = null) {
        label = Language.generateLabel(label);
        super.addButton(category, label, ref, def, visible, text, callback);
    }

}
