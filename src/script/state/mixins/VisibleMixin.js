import EventBus from "/emcJS/util/events/EventBus.js";
import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import StateStorage from "/script/storage/StateStorage.js";
import StateDataMixin from "./StateDataMixin.js";

function valueGetter(key) {
    return this.get(key);
}

function calculateVisibility(data) {
    const visible_logic = VISIBLE_LOGIC.get(this);
    if (typeof visible_logic == "function") {
        const visible = VISIBLE.get(this);
        const value = !!visible_logic(valueGetter.bind(data));
        VISIBLE.set(this, value);
        if (visible != value) {
            const event = new Event("visible");
            event.data = value;
            this.dispatchEvent(event);
        }
    }
}

const VISIBLE = new WeakMap();
const VISIBLE_LOGIC = new WeakMap();

export default (CLAZZ) => class extends StateDataMixin(CLAZZ) {

    constructor(ref, props, ...args) {
        super(ref, props, ...args);
        /* --- */
        const stored_data = new Map(Object.entries(StateStorage.getAll()));
        /* VISIBLE */
        if (typeof props.visible == "object") {
            const visible_logic = LogicCompiler.compile(props.visible);
            VISIBLE.set(this, !!visible_logic(valueGetter.bind(stored_data)));
            VISIBLE_LOGIC.set(this, visible_logic);
        } else {
            VISIBLE.set(this, !!props.visible);
        }
        /* EVENTS */
        EventBus.register("state", event => {
            const data = new Map(Object.entries(event.data.state));
            calculateVisibility(data);
        });
        EventBus.register("randomizer_options", event => {
            const data = new Map(Object.entries(event.data));
            calculateVisibility(data);
        });
    }

    get visible() {
        return !!VISIBLE.get(this);
    }

}
