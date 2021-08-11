// frameworks
import DataStorageObserver from "/emcJS/datastorage/DataStorageObserver.js";

import OptionsStorage from "../../storage/OptionsStorage.js";

export default class OptionsObserver extends DataStorageObserver {

    constructor(key) {
        super(OptionsStorage, key);
    }

}
