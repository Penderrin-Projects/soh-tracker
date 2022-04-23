// frameworks
import FileLoader from "/emcJS/util/FileLoader.js";
import Logger from "/emcJS/util/Logger.js";
import I18n from "/emcJS/i18n/I18n.js";
import I18nLabel from "/emcJS/i18n/ui/I18nLabel.js";
import I18nTooltip from "/emcJS/i18n/ui/I18nTooltip.js";

import SettingsObserver from "./observer/SettingsObserver.js";

const languageObserver = new SettingsObserver("language");

let languages = null;

class Language {

    constructor() {
        languageObserver.addEventListener("change", event => {
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
                    } catch (err) {
                        console.error(err);
                        Logger.error(new Error(`could not load lang ${key}`), "I18n");
                    }
                    I18n.setLanguage(code);
                }
            } catch (err) {
                console.error(err);
                Logger.error(new Error(`could not load language names`), "I18n");
            }
        }
    }

    getLanguages() {
        return Object.keys(languages);
    }

    translate(index) {
        if (!index) {
            return "";
        }
        return I18n.get(index);
    }

    generateLabel(key) {
        const el = document.createElement("emc-i18n-label");
        el.i18nValue = key;
        return el;
    }

    generateTooltip(key) {
        const el = document.createElement("emc-i18n-tooltip");
        el.i18nTooltip = key;
        return el;
    }

    applyLabel(el, key) {
        if (el.children[0] instanceof I18nLabel) {
            const label = el.children[0];
            label.i18nValue = key;
            return el;
        } else {
            const label = this.generateLabel(key);
            el.innerHTML = "";
            el.append(label);
            return el;
        }
    }

    applyTooltip(el, key) {
        if (el.parentElement instanceof I18nTooltip) {
            const tooltip = el.parentElement;
            tooltip.i18nValue = key;
            return tooltip;
        } else {
            const tooltip = this.generateTooltip(key);
            tooltip.append(el);
            return tooltip;
        }
    }

}

export function i18n(strings, ...values) {
    const key = [strings.raw[0]];
    values.forEach((v, k) => key.push(v, strings.raw[k + 1]));
    return I18n.get(key.join(""));
}

export default new Language();
