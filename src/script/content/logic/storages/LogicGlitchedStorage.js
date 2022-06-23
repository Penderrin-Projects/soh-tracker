// frameworks
import ObservableIDBProxyStorage from "/emcJS/data/storage/observable/ObservableIDBProxyStorage.js";

class LogicGlitchedStorage extends ObservableIDBProxyStorage {

    constructor() {
        super("logics_glitched");
    }

}

const storage = new LogicGlitchedStorage();

export default await storage.awaitLoaded();
