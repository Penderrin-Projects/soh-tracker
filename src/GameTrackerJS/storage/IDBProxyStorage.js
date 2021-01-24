import IDBStorage from "/emcJS/storage/IDBStorage.js";
import DataStorage from "./DataStorage.js";

const STORAGE = new WeakMap();

export default class IDBProxyStorage extends DataStorage {

    constructor(name) {
        super();
        STORAGE.set(this, new IDBStorage(name));
    }

    async init() {
        const storage = STORAGE.get(this);
        const data = await storage.getAll();
        super.setAll(data);
    }

    set(key, value) {
        const storage = STORAGE.get(this);
        storage.set(key, value);
        super.set(key, value);
    }

    setAll(values) {
        const storage = STORAGE.get(this);
        storage.setAll(values);
        super.setAll(values);
    }

    clear() {
        const storage = STORAGE.get(this);
        storage.clear();
        super.clear();
    }

}
