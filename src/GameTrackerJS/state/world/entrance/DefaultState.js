import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import StateData from "../../abstract/StateData.js";

function valueGetter(key) {
    return this.get(key);
}

const ACTIVE = new WeakMap();
const ACTIVE_LOGIC = new WeakMap();

export default class DefaultState extends StateData {

    constructor(ref, props) {
        super(ref, props);
        /* --- */

        /* ACTIVE */
        if (typeof props.active == "object") {
            const stored_data = new Map(Object.entries(StateStorage.getAll()));
            const active_logic = LogicCompiler.compile(props.active);
            ACTIVE.set(this, !!active_logic(valueGetter.bind(stored_data)));
            ACTIVE_LOGIC.set(this, active_logic);
        } else {
            ACTIVE.set(this, !!props.active);
        }

        /* EVENTS */
        EventBus.register("state", event => {
            const data = new Map(Object.entries(event.data.state));
            this.calculateActive(data);
        });
        EventBus.register("randomizer_options", event => {
            const data = new Map(Object.entries(event.data));
            this.calculateActive(data);
        });
    }
    
    /*#*/calculateActive(data) {
        const active_logic = ACTIVE_LOGIC.get(this);
        if (typeof active_logic == "function") {
            const active = ACTIVE.get(this);
            const value = !!active_logic(valueGetter.bind(data));
            if (active != value) {
                ACTIVE.set(this, value);
                const event = new Event("active");
                event.data = value;
                this.dispatchEvent(event);
            }
        }
    }

    get active() {
        return ACTIVE.get(this);
    }

}
