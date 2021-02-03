import Language from "./Language.js";

const VARS = {
    "I18n.languages": Language.getLanguages
};

function convertValueList(values = [], names = []) {
    const opt = {};
    if (typeof values == "string") {
        values = VARS[values]();
    }
    if (typeof values == "object") {
        for (const k in values) {
            if (names[k] != null) {
                opt[values[k]] = Language.generateLabel(names[k]);
            } else {
                opt[values[k]] = Language.generateLabel(values[k]);
            }
        }
    }
    return opt;
}

class SettingsBuilder {

    build(window, options) {
        for (const key in options) {
            const option = options[key];
            const category = option.category;
            const label = Language.generateLabel(key);
            const min = parseFloat(option.min);
            const max = parseFloat(option.max);
            switch (option.type) {
                case "string":
                    window.addStringInput(category, label, key, option.default);
                    break;
                case "number":
                    window.addNumberInput(category, label, key, option.default, min, max);
                    break;
                case "range":
                    window.addRangeInput(category, label, key, option.default, min, max);
                    break;
                case "check":
                    window.addCheckInput(category, label, key, option.default);
                    break;
                case "choice":
                    window.addChoiceInput(category, label, key, option.default, convertValueList(option.values, option.names));
                    break;
                case "list":
                    window.addListSelectInput(category, label, key, option.default, true, convertValueList(option.values, option.names));
                    break;
                case "button":
                    window.addButton(category, label, key, Language.generateLabel(option.text), alert.bind(window, "not functionality bound"));
                    break;
            }
        }
    }

}

export default new SettingsBuilder();
