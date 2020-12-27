import EventBus from "/emcJS/event/EventBus.js";
import StateWorld from "../../abstract/StateWorld.js";
import Logic from "/script/util/logic/Logic.js";

const ACCESS = new WeakMap();

export default class DefaultState extends StateWorld {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        ACCESS.set(this, Logic.getValue(props.access));
        /* EVENTS */
        EventBus.register("state", event => {
            this.stateLoaded(event);
        });
        EventBus.register("logic", event => {
            const access = Logic.getValue(props.access);
            if (access != null) {
                const old = ACCESS.get(this);
                if (access != old) {
                    ACCESS.set(this, access);
                    // external
                    const ev = new Event("access");
                    ev.data = access;
                    this.dispatchEvent(ev);
                }
            }
        });
    }

    stateLoaded(event) {
        // empty
    }

    get access() {
        return ACCESS.get(this);
    }

}
