import OptionsResource from "../../../resource/OptionsResource.js";
import OptionsStorage from "../../../storage/OptionsStorage.js";
import SettingsBuilder from "../../../util/SettingsBuilder.js";
import SettingsWindow from "./SettingsWindow.js";
import BusyIndicator from "../../../ui/BusyIndicator.js";

export default class SavestateOptionsWindow extends SettingsWindow {

    constructor() {
        super() ;
        /* --- */
        const options = OptionsResource.get();
        SettingsBuilder.build(this, options);
        /* --- */
        this.addEventListener("submit", function(event) {
            BusyIndicator.busy();
            const settings = event.data;
            OptionsStorage.setAll(settings);
            BusyIndicator.unbusy();
        });
    }

    show() {
        const values = OptionsStorage.getAll();
        super.show(values);
    }

}

customElements.define("gt-window-savestateoptions", SavestateOptionsWindow);
