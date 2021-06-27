import DataStorageSpy from "./DataStorageSpy.js";
import SettingsStorage from "../../storage/SettingsStorage.js";

export default class SettingsSpy extends DataStorageSpy {

    constructor(key) {
        super(SettingsStorage, key);
    }

}
