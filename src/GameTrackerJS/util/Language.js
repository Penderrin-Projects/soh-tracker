// frameworks
import FileLoader from "/emcJS/util/FileLoader.js";
import Logger from "/emcJS/util/Logger.js";
import I18n from "/emcJS/i18n/I18n.js";
import I18nLabel from "/emcJS/i18n/ui/Label.js";
import I18nTooltip from "/emcJS/i18n/ui/Tooltip.js";

import SettingsSpy from "./spy/SettingsSpy.js";

const languageSpy = new SettingsSpy("language");

let languages = null;

class Language {

    constructor() {
        languageSpy.addEventListener("change", event => {
            I18n.setLanguage(event.data);
        });
    }

    async load(code) {
        if (languages == null) {
            try {
                languages = await FileLoader.json("/i18n/_meta.json");
                for (const key in languages) {
                    try {
                        const trans = await FileLoader.properties(`/i18n/${key}.lang`);
                        I18n.setTranslation(key, Object.assign(trans, languages));
                    } catch(err) {
                        console.error(err);
                        Logger.error((new Error(`could not load lang ${key}`)), "I18n");
                    }
                    I18n.setLanguage(code);
                }
            } catch(err) {
                console.error(err);
                Logger.error((new Error(`could not load language names`)), "I18n");
            }
        }
    }

    getLanguages() {
        return Object.keys(languages);
    }

    translate(index) {
        if (!index) return "";
        return I18n.get(index);
    }

    generateLabel(key, value) {
        const el = document.createElement("emc-i18n-label");
        el.i18nKey = key;
        if (value != null) {
            el.i18nValue = value;
        }
        return el;
    }

    generateTooltip(key, value) {
        const el = document.createElement("emc-i18n-tooltip");
        el.i18nKey = key;
        if (value != null) {
            el.i18nValue = value;
        }
        return el;
    }

    applyLabel(el, key, value) {
        if (el.children[0] instanceof I18nLabel) {
            const label = el.children[0];
            label.i18nKey = key;
            if (value != null) {
                label.i18nValue = value;
            }
            return el;
        } else {
            const label = this.generateLabel(key, value);
            el.innerHTML = "";
            el.append(label);
            return el;
        }
    }

    applyTooltip(el, key, value) {
        if (el.parentElement instanceof I18nTooltip) {
            const tooltip = el.parentElement;
            tooltip.i18nKey = key;
            if (value != null) {
                tooltip.i18nValue = value;
            }
            return tooltip;
        } else {
            const tooltip = this.generateTooltip(key, value);
            tooltip.append(el);
            return tooltip;
        }
    }

}

export default new Language();
