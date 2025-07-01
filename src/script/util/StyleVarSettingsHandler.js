import StyleVariables from "/emcJS/util/html/style/GlobalStyleVariables.js";
import SettingsObserver from "/GameTrackerJS/util/observer/SettingsObserver.js";

export default class StyleVarSettingsHandler {

    constructor(ref, name) {
        const observer = new SettingsObserver(ref);
        observer.addEventListener("change", (event) => {
            StyleVariables.set(name, event.value);
        });
        StyleVariables.set(name, observer.value);
    }

}
