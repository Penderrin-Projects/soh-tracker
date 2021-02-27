import DataStorageSpy from "./DataStorageSpy.js";
import FilterStorage from "../../storage/FilterStorage.js";

export default class FilterSpy extends DataStorageSpy {

    constructor(key) {
        super(FilterStorage, key);
    }

}
