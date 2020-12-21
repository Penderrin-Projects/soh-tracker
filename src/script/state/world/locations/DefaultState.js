import EventBus from "/emcJS/event/EventBus.js";
import StateFilter from "/script/state/abstract/StateFilter.js";
import WorldRegistry from "/script/state/WorldRegistry.js";
import Logic from "/script/util/logic/Logic.js";

const ACCESS = new WeakMap();

function internalChange(event) {
    const ref = this.ref;
    // savesatate
    const change = event.data[ref];
    if (change != null) {
        this.value = !!change.newValue;
    }
}

export default class DefaultState extends StateFilter {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        ACCESS.set(this, Logic.getValue(props.access));
        /* EVENTS */
        // TODO get access on logic change
        EventBus.register("state_location", internalChange.bind(this));
        EventBus.register("net:state_location", internalChange.bind(this));
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
        EventBus.register("logic", event => {
            const access = event.data[props.access];
            if (access != null) {
                ACCESS.set(this, access);
                const event = new Event("access");
                event.data = access;
                this.dispatchEvent(event);
            }
        });
        /* register */
        WorldRegistry.set(`location/${ref}`, this);
    }

    stateLoaded(event) {
        // empty
    }

    get access() {
        return ACCESS.get(this);
    }

}
