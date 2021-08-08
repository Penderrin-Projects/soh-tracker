import DataStorageObserver from "./DataStorageObserver.js";
import StartItemsStorage from "../../storage/StartItemsStorage.js";

export default class StartItemsObserver extends DataStorageObserver {

    constructor(key) {
        super(StartItemsStorage, key);
    }

}
