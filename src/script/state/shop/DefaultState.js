// frameworks
import EventBus from "/emcJS/event/EventBus.js";

// GameTrackerJS
import SavestateHandler from "/GameTrackerJS/savestate/SavestateHandler.js";
import OptionsStorage from "/GameTrackerJS/storage/OptionsStorage.js";
import Observable from "/GameTrackerJS/data/Observable.js";
import DataState from "/GameTrackerJS/state/abstract/DataState.js";
// Track-OOT
import ShopItemsResource from "/script/resource/ShopItemsResource.js";
import ShopLocationRegistry from "/script/registry/ShopLocationRegistry.js";

const OBSERVABLE_DATA = new WeakMap();
const ITEM_DATA = new WeakMap();
const DEF_ITEM_DATA = new WeakMap();

function internalItemChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this./*#*/__setItem(change.value);
    }
}

function internalPriceChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this./*#*/__setPrice(change.value);
    }
}

function internalBoughtChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this./*#*/__setBought(change.value);
    }
}

function internalNameChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this./*#*/__setName(change.value);
    }
}

export default class DefaultState extends DataState {

    constructor(ref, props, defItemData) {
        super(ref, props);
        /* --- */
        DEF_ITEM_DATA.set(this, defItemData);
        /* --- */
        const observableData = new Observable();
        OBSERVABLE_DATA.set(this, observableData);
        observableData.addEventListener("item", event => {
            const ev = new Event("item");
            ev.data = event.value ?? this.item;
            this.dispatchEvent(ev);
        });
        observableData.addEventListener("price", event => {
            const ev = new Event("price");
            ev.data = event.value ?? this.price;
            this.dispatchEvent(ev);
        });
        observableData.addEventListener("bought", event => {
            const ev = new Event("bought");
            ev.data = event.value ?? this.bought;
            this.dispatchEvent(ev);
        });
        observableData.addEventListener("name", event => {
            const ev = new Event("name");
            ev.data = event.value ?? this.name;
            this.dispatchEvent(ev);
        });
        /* --- */
        {
            // item
            const item = SavestateHandler.get("shops", `${ref}.item`);
            if (item != null) {
                const itemData = ShopItemsResource.get(item);
                ITEM_DATA.set(this, itemData);
                observableData.set("item", item);
            }
            // price
            const price = SavestateHandler.get("shops", `${ref}.price`);
            if (price != null) {
                observableData.set("price", price);
            }
            // bought
            const bought = SavestateHandler.get("shops", `${ref}.bought`);
            if (bought != null) {
                observableData.set("bought", bought);
            }
            // name
            const name = SavestateHandler.get("shops", `${ref}.name`);
            if (name != null) {
                observableData.set("name", name);
            }
        }
        /* EVENTS */
        EventBus.register("state::shop_item", internalItemChange.bind(this));
        EventBus.register("state::shop_price", internalPriceChange.bind(this));
        EventBus.register("state::shop_bought", internalBoughtChange.bind(this));
        EventBus.register("extra::shop_name", internalNameChange.bind(this));
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
        /* --- */
        if (props.ref != null) {
            ShopLocationRegistry.set(props.ref, this);
        }
    }

    stateLoaded(event) {
        const ref = this.ref;
        const observableData = OBSERVABLE_DATA.get(this);
        if (ref) {
            if (event.data.extra.shops != null) {
                // item
                const item = event.data.extra.shops[`${ref}.item`];
                if (item != null) {
                    const itemData = ShopItemsResource.get(item);
                    ITEM_DATA.set(this, itemData);
                    observableData.set("item", item);
                } else {
                    ITEM_DATA.delete(this);
                    observableData.delete("item");
                }
                // price
                const price = event.data.extra.shops[`${ref}.price`];
                if (price != null) {
                    observableData.set("price", price);
                } else {
                    observableData.delete("price");
                }
                // bought
                const bought = event.data.extra.shops[`${ref}.bought`];
                if (bought != null) {
                    observableData.set("bought", bought);
                } else {
                    observableData.delete("bought");
                }
                // name
                const name = event.data.extra.shops[`${ref}.name`];
                if (name != null) {
                    observableData.set("name", name);
                } else {
                    observableData.delete("name");
                }
            } else {
                ITEM_DATA.delete(this);
                observableData.delete("item");
                observableData.delete("price");
                observableData.delete("bought");
                observableData.delete("name");
            }
        }
    }

    /*#*/__setItem(value) {
        const ref = this.ref;
        const observableData = OBSERVABLE_DATA.get(this);
        if (typeof value != "string") {
            value = "";
        }
        const old = observableData.get("item");
        if (value != old) {
            SavestateHandler.set("shops", `${ref}.item`, value);
            // data
            const itemData = ShopItemsResource.get(value);
            if (itemData != null) {
                ITEM_DATA.set(this, itemData);
            } else {
                const defItemData = ShopItemsResource.get(this.props.item);
                ITEM_DATA.set(this, defItemData);
            }
            // bought
            if (itemData != null && itemData.refill) {
                observableData.set("bought", true);
                SavestateHandler.set("shops", `${ref}.bought`, true);
            } else {
                observableData.set("bought", false);
                SavestateHandler.set("shops", `${ref}.bought`, false);
            }
            // value
            observableData.set("item", value);
        }
        return value;
    }

    set item(value) {
        const ref = this.ref;
        const old = this.item;
        value = this./*#*/__setItem(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("state::shop_item", {ref, value});
        }
    }

    get item() {
        if (!ITEM_DATA.has(this) && OptionsStorage.get("option.shopsanity") != "off") {
            return "unknown";
        }
        const observableData = OBSERVABLE_DATA.get(this);
        if (observableData.has("item")) {
            return observableData.get("item");
        }
        return this.props.item;
    }

    /*#*/__setPrice(value) {
        const ref = this.ref;
        const observableData = OBSERVABLE_DATA.get(this);
        value = parseInt(value);
        if (isNaN(value) || value < 0) {
            value = 0;
        }
        if (value > 999) {
            value = 999;
        }
        const old = observableData.get("price");
        if (value != old) {
            SavestateHandler.set("shops", `${ref}.price`, value);
            // value
            observableData.set("price", value);
        }
        return value;
    }

    set price(value) {
        const ref = this.ref;
        const old = this.price;
        value = this./*#*/__setPrice(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("state::shop_price", {ref, value});
        }
    }

    get price() {
        if (!ITEM_DATA.has(this) && OptionsStorage.get("option.shopsanity") != "off") {
            return "?";
        }
        const observableData = OBSERVABLE_DATA.get(this);
        if (observableData.has("price")) {
            return observableData.get("price");
        }
        return this.props.price;
    }

    /*#*/__setBought(value) {
        const itemData = ITEM_DATA.get(this);
        if (itemData != null && !itemData.refill) {
            const ref = this.ref;
            const observableData = OBSERVABLE_DATA.get(this);
            if (typeof value != "boolean") {
                value = false;
            }
            const old = observableData.get("bought");
            if (value != old) {
                SavestateHandler.set("shops", `${ref}.bought`, value);
                // value
                observableData.set("bought", value);
            }
            return value;
        }
    }
    
    set bought(value) {
        const ref = this.ref;
        const old = this.reward;
        value = this./*#*/__setBought(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("state::shop_bought", {ref, value});
        }
    }

    get bought() {
        if (!ITEM_DATA.has(this) && OptionsStorage.get("option.shopsanity") != "off") {
            return false;
        }
        const observableData = OBSERVABLE_DATA.get(this);
        if (observableData.has("bought")) {
            return observableData.get("bought");
        }
        return false;
    }

    /*#*/__setName(value) {
        const ref = this.ref;
        const observableData = OBSERVABLE_DATA.get(this);
        if (typeof value != "string") {
            value = "";
        }
        const old = observableData.get("name");
        if (value != old) {
            SavestateHandler.set("shops", `${ref}.name`, value);
            // value
            observableData.set("name", value);
        }
        return value;
    }

    set name(value) {
        const ref = this.ref;
        const old = this.reward;
        value = this./*#*/__setName(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("extra::shop_name", {ref, value});
        }
    }

    get name() {
        const observableData = OBSERVABLE_DATA.get(this);
        if (observableData.has("name")) {
            return observableData.get("name");
        }
        return "";
    }

    get itemData() {
        if (ITEM_DATA.has(this)) {
            return ITEM_DATA.get(this);
        }
        if (OptionsStorage.get("option.shopsanity") != "off") {
            return {
                "image": "/images/unknown.svg",
                "category": "hidden_items",
                "refill": true,
                "mark": false,
                "price": "?"
            };
        }
        return DEF_ITEM_DATA.get(this);
    }

    isDefault() {
        return !ITEM_DATA.has(this);
    }

    reset() {
        const ref = this.ref;
        const observableData = OBSERVABLE_DATA.get(this);
        SavestateHandler.delete("shops", `${ref}.item`);
        SavestateHandler.delete("shops", `${ref}.price`);
        SavestateHandler.delete("shops", `${ref}.bought`);
        SavestateHandler.delete("shops", `${ref}.name`);
        ITEM_DATA.delete(this);
        observableData.delete("item");
        observableData.delete("price");
        observableData.delete("bought");
        observableData.delete("name");
    }

}
