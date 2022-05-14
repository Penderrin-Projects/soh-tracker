// frameworks
import StyleVariables from "/emcJS/util/html/StyleVariables.js";

// GameTrackerJS
import SettingsObserver from "/GameTrackerJS/util/observer/SettingsObserver.js";

export default class StyleVarSettingsHandler {

    constructor(ref, name) {
        const observer = new SettingsObserver(ref);
        observer.addEventListener("change", event => {
            StyleVariables.set(name, event.value);
        });
        StyleVariables.set(name, observer.value);
    }

}
