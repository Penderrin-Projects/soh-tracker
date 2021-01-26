import FileData from "/emcJS/data/FileData.js";
import SettingsStorage from "../../storage/SettingsStorage.js";
import SettingsWindow from "./SettingsWindow.js";
import BusyIndicator from "/script/ui/BusyIndicator.js";
import StateStorage from "/script/storage/StateStorage.js";

// TODO bind erase stored data button

import SettingsBuilder from "../../util/SettingsBuilder.js";

BusyIndicator.setIndicator(document.getElementById("busy-animation"));

function applySettingsChoices(settings) {
    const viewpane = document.getElementById("main-content");
    viewpane.setAttribute("data-font", settings.font);
    document.querySelector("#layout-container").setAttribute("layout", settings.layout);
    document.body.style.setProperty("--item-size", settings.itemsize);
    StateStorage.setAutosave(settings.autosave_amount, settings.autosave_time);
}
applySettingsChoices(SettingsStorage.getAll());

export default class AppSettingsWindow extends SettingsWindow {

    constructor() {
        super() ;
        /* --- */
        const options = FileData.get("settings");
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
