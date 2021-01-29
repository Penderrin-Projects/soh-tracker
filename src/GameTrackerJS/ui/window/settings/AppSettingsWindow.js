import SettingsResource from "../../../resource/SettingsResource.js";
import SettingsStorage from "../../../storage/SettingsStorage.js";
import SettingsBuilder from "../../../util/SettingsBuilder.js";
import SettingsWindow from "./SettingsWindow.js";
import BusyIndicator from "../../../ui/BusyIndicator.js";
import SavestateHandler from "../../../savestate/SavestateHandler.js";

// TODO bind erase stored data button

function applySettingsChoices(settings) {
    const viewpane = document.getElementById("main-content");
    viewpane.setAttribute("data-font", settings.font);
    document.querySelector("#layout-container").setAttribute("layout", settings.layout);
    document.body.style.setProperty("--item-size", settings.itemsize);
    SavestateHandler.setAutosave(settings.autosave_amount, settings.autosave_time);
}
applySettingsChoices(SettingsStorage.getAll());

export default class AppSettingsWindow extends SettingsWindow {

    constructor() {
        super() ;
        /* --- */
        const options = SettingsResource.get();
        SettingsBuilder.build(this, options);
        /* --- */
        this.addEventListener("submit", function(event) {
            BusyIndicator.busy();
            const settings = event.data;
            SettingsStorage.setAll(settings);
            applySettingsChoices(settings);
            BusyIndicator.unbusy();
        });
    }

    show(category = "settings") {
        const values = SettingsStorage.getAll();
        super.show(values, category);
    }

}

customElements.define("gt-window-appsettings", AppSettingsWindow);
