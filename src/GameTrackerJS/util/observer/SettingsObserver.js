// frameworks
import DataStorageObserver from "/emcJS/datastorage/DataStorageObserver.js";

import SettingsStorage from "../../storage/SettingsStorage.js";

export default class SettingsObserver extends DataStorageObserver {

    constructor(key) {
        super(SettingsStorage, key);
    }

}
