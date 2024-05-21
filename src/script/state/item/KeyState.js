import ItemStateManager from "/GameTrackerJS/statemanager/item/ItemStateManager.js";
import AreaStateManager from "/GameTrackerJS/statemanager/world/area/AreaStateManager.js";
import {
    parseSafeRange
} from "/GameTrackerJS/util/helper/ItemHelper.js";
import DefaultAPItemState from "./DefaultAPItemState.js";

const AREA = new WeakMap();
const MAX = new WeakMap();

export default class KeyState extends DefaultAPItemState {

    constructor(ref, props) {
        super(ref, props);

        /* VALUES */
        MAX.set(this, super.max);
        if (props.typeMax != null && props.relatedDungeon != null) {
            const area = AreaStateManager.get(props.relatedDungeon);
            if (area != null) {
                AREA.set(this, area);
                if (area.props.lists?.mq != null) {
                    area.addEventListener("activeListChange", (event) => {
                        this.#setMax(props.typeMax[event.value] ?? super.max);
                        const ev = new Event("type");
                        ev.value = event.value;
                        this.dispatchEvent(ev);
                    });
                    MAX.set(this, props.typeMax[area.activeList] ?? super.max);
                }
            }
        }
    }

    #setMax(value) {
        const newMax = parseSafeRange(value, this.defaultMax);
        const oldMax = MAX.get(this);
        if (newMax != oldMax) {
            const oldValue = this.value;
            MAX.set(this, newMax);
            // external max
            const event = new Event("max");
            event.value = newMax;
            this.dispatchEvent(event);
            // external value
            const newValue = this.value;
            if (oldValue != newValue) {
                const event = new Event("value");
                event.value = newValue;
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
            return area.activeList;
        }
        return "v";
    }

}

ItemStateManager.register("key", KeyState);
