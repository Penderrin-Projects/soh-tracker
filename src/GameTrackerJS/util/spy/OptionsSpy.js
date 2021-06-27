import DataStorageSpy from "./DataStorageSpy.js";
import OptionsStorage from "../../storage/OptionsStorage.js";

export default class OptionsSpy extends DataStorageSpy {

    constructor(key) {
        super(OptionsStorage, key);
    }

}
