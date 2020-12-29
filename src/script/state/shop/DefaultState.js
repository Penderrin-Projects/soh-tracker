import FileData from "/emcJS/data/FileData.js";
import EventBus from "/emcJS/event/EventBus.js";
import StateData from "/GameTrackerJS/state/abstract/StateData.js";
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
        this.item = change.value;
    }
}

function internalPriceChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this.price = change.value;
    }
}

function internalBoughtChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this.bought = change.value;
    }
}

function internalNameChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data;
    if (change != null && change.ref == ref) {
        this.name = change.value;
    }
}

export default class DefaultState extends StateData {

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
                // bought
                const name = event.data.extra.shops[`${ref}.name`];
                if (name != null) {
                    this.name = bought;
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

    /*#*/applyItem() {
        const item = ITEM.get(this);
        const data = FileData.get(`shop_items/${item}`);
        ITEM_DATA.set(this, data);
        const bought = BOUGHT.get(this);
        if (bought) {
            ICON.set(this, "/images/items/sold_out.png");
        } else {
            if (data) {
                ICON.set(this, data.image);
            } else {
                ICON.set(this, "/images/items/unknown.png");
            }
        }
    }

    set item(value) {
        const ref = this.ref;
        if (typeof value != "string") {
            value = "";
        }
        const old = ITEM.get(this);
        if (value != old) {
            ITEM.set(this, value);
            StateStorage.writeExtra("shops", `${ref}.item`, value);
            this.applyItem();
            // external
            const event = new Event("item");
            event.data = value;
            this.dispatchEvent(event);
            // internal
            EventBus.trigger("state::shop_item", {ref, value});
        }
    }

    get item() {
        return ITEM.get(this);
    }

    set price(value) {
        const ref = this.ref;
        value = parseInt(value);
        if (isNaN(value)) {
            value = 0;
        }
        const old = PRICE.get(this);
        if (value != old) {
            PRICE.set(this, value);
            StateStorage.writeExtra("shops", `${ref}.price`, value);
            // external
            const event = new Event("price");
            event.data = value;
            this.dispatchEvent(event);
            // internal
            EventBus.trigger("state::shop_price", {ref, value});
        }
    }

    get price() {
        return PRICE.get(this);
    }

    set bought(value) {
        const ref = this.ref;
        if (typeof value != "boolean") {
            value = false;
        }
        const old = BOUGHT.get(this);
        if (value != old) {
            BOUGHT.set(this, value);
            StateStorage.writeExtra("shops", `${ref}.bought`, value);
            this.applyItem();
            // external
            const event = new Event("bought");
            event.data = value;
            this.dispatchEvent(event);
            // internal
            EventBus.trigger("state::shop_bought", {ref, value});
        }
    }

    get bought() {
        return BOUGHT.get(this);
    }

    set name(value) {
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

    get custom() {
        const itemData = ITEM_DATA.get(this);
        if (itemData != null) {
            return !itemData.refill;
        }
        return false;
    }

}
