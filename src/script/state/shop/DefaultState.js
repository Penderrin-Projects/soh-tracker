/* asym-import: off */
import EventBus from "/emcJS/event/EventBus.js";
/* asym-import: on */

// GameTrackerJS
import DataState from "/GameTrackerJS/state/abstract/DataState.js";
// Track-OOT
import ShopItemsResource from "/script/resource/ShopItemsResource.js";
import StateStorage from "/script/storage/StateStorage.js";

const ITEM = new WeakMap();
const PRICE = new WeakMap();
const BOUGHT = new WeakMap();
const NAME = new WeakMap();

const ITEM_DATA = new WeakMap();
const ICON = new WeakMap();

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

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        this.item = StateStorage.readExtra("shops", `${ref}.item`, props.item);
        this.price = StateStorage.readExtra("shops", `${ref}.price`, props.price);
        this.bought = StateStorage.readExtra("shops", `${ref}.bought`, false);
        this.name = StateStorage.readExtra("shops", `${ref}.name`, "");
        /* EVENTS */
        EventBus.register("state::shop_item", internalItemChange.bind(this));
        EventBus.register("state::shop_price", internalPriceChange.bind(this));
        EventBus.register("state::shop_bought", internalBoughtChange.bind(this));
        EventBus.register("extra::shop_name", internalNameChange.bind(this));
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
    }

    stateLoaded(event) {
        const ref = this.ref;
        if (ref) {
            if (event.data.extra.shops != null) {
                // item
                const item = event.data.extra.shops[`${ref}.item`];
                if (item != null) {
                    this.item = item;
                } else {
                    this.item = this.props.item;
                }
                // price
                const price = event.data.extra.shops[`${ref}.price`];
                if (price != null) {
                    this.price = price;
                } else {
                    this.price = this.props.price;
                }
                // bought
                const bought = event.data.extra.shops[`${ref}.bought`];
                if (bought != null) {
                    this.bought = bought;
                } else {
                    this.bought = false;
                }
                // name
                const name = event.data.extra.shops[`${ref}.name`];
                if (name != null) {
                    this.name = name;
                } else {
                    this.name = "";
                }
            } else {
                this.item = this.props.item;
                this.price = this.props.price;
                this.bought = false;
                this.name = "";
            }
        }
    }

    /*#*/__applyItem() {
        const ref = this.ref;
        const item = ITEM.get(this);
        const itemData = ShopItemsResource.get(item);
        ITEM_DATA.set(this, itemData);
        if (itemData != null && itemData.refill) {
            BOUGHT.set(this, false);
            StateStorage.writeExtra("shops", `${ref}.bought`, false);
            ICON.set(this, itemData.image);
        } else {
            const bought = BOUGHT.get(this);
            if (bought) {
                ICON.set(this, "/images/items/sold_out.png");
            } else {
                if (itemData != null) {
                    ICON.set(this, itemData.image);
                } else {
                    ICON.set(this, "/images/items/unknown.png");
                }
            }
        }
    }

    /*#*/__setItem(value) {
        const ref = this.ref;
        if (typeof value != "string") {
            value = "";
        }
        const old = ITEM.get(this);
        if (value != old) {
            ITEM.set(this, value);
            StateStorage.writeExtra("shops", `${ref}.item`, value);
            this./*#*/__applyItem();
            // external
            const event = new Event("item");
            event.data = value;
            this.dispatchEvent(event);
        }
        return value;
    }

    set item(value) {
        const ref = this.ref;
        const old = this.reward;
        value = this./*#*/__setItem(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("state::shop_item", {ref, value});
        }
    }

    get item() {
        return ITEM.get(this);
    }

    /*#*/__setPrice(value) {
        const ref = this.ref;
        value = parseInt(value);
        if (isNaN(value) || value < 0) {
            value = 0;
        }
        if (value > 999) {
            value = 999;
        }
        const old = PRICE.get(this);
        if (value != old) {
            PRICE.set(this, value);
            StateStorage.writeExtra("shops", `${ref}.price`, value);
            // external
            const event = new Event("price");
            event.data = value;
            this.dispatchEvent(event);
        }
        return value;
    }

    set price(value) {
        const ref = this.ref;
        const old = this.reward;
        value = this./*#*/__setPrice(value);
        if (value != null && value != old) {
            // internal
            EventBus.trigger("state::shop_price", {ref, value});
        }
    }

    get price() {
        return PRICE.get(this);
    }

    /*#*/__setBought(value) {
        const itemData = ITEM_DATA.get(this);
        if (!itemData.refill) {
            const ref = this.ref;
            if (typeof value != "boolean") {
                value = false;
            }
            const old = BOUGHT.get(this);
            if (value != old) {
                BOUGHT.set(this, value);
                StateStorage.writeExtra("shops", `${ref}.bought`, value);
                this./*#*/__applyItem();
                // external
                const event = new Event("bought");
                event.data = value;
                this.dispatchEvent(event);
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
        return BOUGHT.get(this);
    }

    /*#*/__setName(value) {
        const ref = this.ref;
        if (typeof value != "string") {
            value = "";
        }
        const old = NAME.get(this);
        if (value != old) {
            NAME.set(this, value);
            StateStorage.writeExtra("shops", `${ref}.name`, value);
            // external
            const event = new Event("name");
            event.data = value;
            this.dispatchEvent(event);
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
        return NAME.get(this);
    }

    get icon() {
        return ICON.get(this);
    }

    get mark() {
        const itemData = ITEM_DATA.get(this);
        if (itemData != null) {
            return itemData.mark;
        }
        return false;
    }

}
