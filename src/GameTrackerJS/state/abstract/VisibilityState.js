import EventBus from "/emcJS/event/EventBus.js";
import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import DataState from "./DataState.js";
import StateStorage from "/script/storage/StateStorage.js";

function valueGetter(key) {
    return this.get(key);
}

const VISIBLE = new WeakMap();
const VISIBLE_LOGIC = new WeakMap();

export default class VisibilityState extends DataState {

    constructor(ref, props) {
        super(ref, props);
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
            this./*#*/__calculateVisibility(data);
        });
        EventBus.register("randomizer_options", event => {
            const data = new Map(Object.entries(event.data));
            this./*#*/__calculateVisibility(data);
        });
    }
    
    /*#*/__calculateVisibility(data) {
        const visible_logic = VISIBLE_LOGIC.get(this);
        if (typeof visible_logic == "function") {
            const visible = VISIBLE.get(this);
            const value = !!visible_logic(valueGetter.bind(data));
            if (visible != value) {
                VISIBLE.set(this, value);
                const event = new Event("visible");
                event.data = value;
                this.dispatchEvent(event);
            }
        }
    }

    get visible() {
        return !!VISIBLE.get(this);
    }

}
