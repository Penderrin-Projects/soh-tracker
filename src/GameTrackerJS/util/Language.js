// frameworks
import ObjectHelper from "/emcJS/util/helper/ObjectHelper.js";
import FileLoader from "/emcJS/util/FileLoader.js";
import Logger from "/emcJS/util/Logger.js";
import I18n from "/emcJS/util/I18n.js";
import I18nLabel from "/emcJS/ui/i18n/I18nLabel.js";
import I18nTooltip from "/emcJS/ui/i18n/I18nTooltip.js";

import SettingsObserver from "./observer/SettingsObserver.js";
import Import from "/emcJS/util/import/Import.js";

const languageObserver = new SettingsObserver("language");

let languages = null;

async function importFragment(type, name) {
    switch (type) {
        case "lang": {
            const trans = await FileLoader.properties(`/i18n/fragments/${name}.lang`);
            return trans;
        }
        case "json": {
            const trans = await FileLoader.jsonc(`/i18n/fragments/${name}.json`);
            return ObjectHelper.flatten(trans);
        }
        case "js": {
            const [exec] = await Import.module(`/i18n/fragments/${name}.js`);
            const trans = exec();
            return ObjectHelper.flatten(trans);
        }
        default: {
            return {};
        }
    }
}

class Language {

    constructor() {
        languageObserver.addEventListener("change", event => {
            I18n.setLanguage(event.value);
        });
    }

    async load(code) {
        if (languages == null) {
            try {
                languages = await FileLoader.json("/i18n/_meta.json");
                const langLabels = {};
                for (const key in languages) {
                    const data = languages[key];
                    langLabels[key] = data["label"];
                }
                for (const key in languages) {
                    const data = languages[key];
                    try {
                        const translationFile = await FileLoader.properties(`/i18n/${key}.lang`);
                        let translation = {};
                        for (const {type, name} of data["fragments"]) {
                            const importTranslation = await importFragment(type, name);
                            translation = Object.assign(translation, importTranslation);
                        }
                        translation = Object.assign(translation, translationFile);
                        translation = Object.assign(translation, langLabels);
                        I18n.setTranslation(key, translation);
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
