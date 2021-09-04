// frameworks
import DefaultingStorage from "/emcJS/datastorage/DefaultingStorage.js";
import SettingsBuilder from "/emcJS/util/SettingsBuilder.js";

import AbstractSettingsWindow from "./AbstractSettingsWindow.js";
import OptionsResource from "../../../resource/OptionsResource.js";
import ItemsResource from "../../../resource/ItemsResource.js";
import OptionsStorage from "../../../storage/OptionsStorage.js";
import StartItemsStorage from "../../../storage/StartItemsStorage.js";
import BusyIndicator from "../../../ui/BusyIndicator.js";

const ITEM_STORAGE = new WeakMap();

export default class SavestateOptionsWindow extends AbstractSettingsWindow {

    constructor() {
        super("Randomizer options") ;
        /* --- */
        const options = OptionsResource.get();
        SettingsBuilder.build(this, options);
        const itemStorage = new DefaultingStorage();
        ITEM_STORAGE.set(this, itemStorage);
        /* --- */
        for (const key of Object.keys(ItemsResource.get())) {
            itemStorage.setDefault(key, 0);
        }
        /* --- */
        this.addEventListener("submit", async (event) => {
            await BusyIndicator.busy();
            /* --- */
            const settings = event.data;
            OptionsStorage.setAll(settings);
            /* --- */
            const items = itemStorage.getAll();
            StartItemsStorage.setAll(items);
            /* --- */
            await BusyIndicator.unbusy();
        });
    }

    show() {
        const values = OptionsStorage.getAll();
        super.show(values);
    }

    overwriteItems(data) {
        const storage = ITEM_STORAGE.get(this);
        storage.deserialize(data);
    }

}

customElements.define("gt-window-savestateoptions", SavestateOptionsWindow);
