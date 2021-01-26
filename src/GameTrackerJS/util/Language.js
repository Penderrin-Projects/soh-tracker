import FileLoader from "/emcJS/util/FileLoader.js";
import Logger from "/emcJS/util/Logger.js";
import I18n from "/emcJS/i18n/I18n.js";
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
        return I18n.translate(index);
    }

}

export default new Language();
