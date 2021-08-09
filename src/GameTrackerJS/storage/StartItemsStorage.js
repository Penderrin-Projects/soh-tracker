// frameworks
import EventBus from "/emcJS/event/EventBus.js";

import ItemsResource from "../resource/ItemsResource.js";
import { parseSafeRange } from "../state/item/DefaultState.js";
import DataStorage from "./DataStorage.js";

const MAX = new Map();

for (const [key, value] of Object.entries(ItemsResource.get())) {
    MAX.set(key, parseSafeRange(value.max, 0));
}

class StartItemsStorage extends DataStorage {

    constructor() {
        super();
        this.addEventListener("change", event => {
            setTimeout(() => {
                EventBus.trigger("startitems", event.data);
            }, 0);
        });
        EventBus.register("startitems", event => {
            this.setAll(event.data);
        });
    }

    set(key, value) {
        const parsedValue = parseSafeRange(value);
        if (parsedValue != null && MAX.has(key)) {
            super.set(key, Math.min(MAX.get(key), Math.max(0, parsedValue)));
        }
    }

    setAll(values) {
        const res = {};
        for (const key in values) {
            const value = parseSafeRange(values[key]);
            if (value != null && MAX.has(key)) {
                res[key] = Math.min(MAX.get(key), Math.max(0, value));
            }
        }
        super.setAll(res);
    }

    get(key, value = 0) {
        if (MAX.has(key)) {
            return super.get(key, value);
        }
        return value;
    }

    getAll() {
        const res = {};
        for (const [key] of MAX) {
            res[key] = super.get(key, 0);
        }
        return res;
    }

    has(key) {
        return MAX.has(key);
    }

    keys() {
        return MAX.keys();
    }

}

const storage = new StartItemsStorage();
export default storage;
