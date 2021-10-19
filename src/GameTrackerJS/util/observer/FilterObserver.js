// frameworks
import DataStorageObserver from "/emcJS/datastorage/DataStorageObserver.js";

import FilterStorage from "../../storage/FilterStorage.js";

export default class FilterObserver extends DataStorageObserver {

    constructor(key) {
        super(FilterStorage, key);
    }

}
