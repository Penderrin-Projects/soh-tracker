// frameworks
import ObservableIDBProxyStorage from "/emcJS/data/storage/observable/ObservableIDBProxyStorage.js";

class LogicStorage extends ObservableIDBProxyStorage {

    constructor() {
        super("logics");
    }

}

const storage = new LogicStorage();

export default await storage.awaitLoaded();
