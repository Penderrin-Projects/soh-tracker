// GameTrackerJS
import ItemStateManager from "/GameTrackerJS/state/item/StateManager.js";
import AreaStateManager from "/GameTrackerJS/state/world/area/StateManager.js";
import { parseSafeRange } from "/GameTrackerJS/util/helper/ItemHelper.js";
import DefaultItemState from "/GameTrackerJS/state/item/DefaultState.js";

const AREA = new WeakMap();
const MAX = new WeakMap();

export default class KeyState extends DefaultItemState {

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        MAX.set(this, super.max);
        if (props["type_max"] != null && props["related_dungeon"] != null) {
            const area = AreaStateManager.get(ref);
            if (area != null) {
                AREA.set(this, area);
                if (area.list_mq != null) {
                    area.addEventListener("type", (event) => {
                        this./*#*/__setMax(props["type_max"][event.data] ?? super.max);
                        const ev = new Event("type");
                        ev.data = event.data;
                        this.dispatchEvent(ev);
                    });
                    MAX.set(this, props["type_max"][area.type] ?? super.max);
                }
            }
        }
    }

    /*#*/__setMax(value) {
        const newMax = parseSafeRange(value, this.defaultMax);
        const oldMax = MAX.get(this);
        if (newMax != oldMax) {
            const oldValue = this.value;
            MAX.set(this, newMax);
            // external max
            const event = new Event("max");
            event.data = newMax;
            this.dispatchEvent(event);
            // external value
            const newValue = this.value;
            if (oldValue != newValue) {
                const event = new Event("value");
                event.data = newValue;
                this.dispatchEvent(event);
            }
        }
    }

    get max() {
        return MAX.get(this) ?? super.max;
    }

    get type() {
        const area = AREA.get(this);
        if (area != null) {
            return area.type;
        }
        return "v";
    }

}

ItemStateManager.register("key", KeyState);
