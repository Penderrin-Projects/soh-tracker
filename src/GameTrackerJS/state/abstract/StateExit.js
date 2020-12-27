import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventBus from "/emcJS/event/EventBus.js";
import StateStorage from "/script/storage/StateStorage.js";
import ExitRegistry from "../../registry/ExitRegistry.js";
import StateWorld from "./StateWorld.js";

function valueGetter(key) {
    return this.get(key);
}

const EXIT_DATA = new WeakMap();
const ACTIVE = new WeakMap();
const ACTIVE_LOGIC = new WeakMap();

export default class StateExit extends StateWorld {

    constructor(ref, props, exitData) {
        super(ref, props);
        /* --- */
        EXIT_DATA.set(this, exitData);
        /* ACTIVE */
        if (typeof exitData.active == "object") {
            const stored_data = new Map(Object.entries(StateStorage.getAll()));
            const active_logic = LogicCompiler.compile(exitData.active);
            ACTIVE.set(this, !!active_logic(valueGetter.bind(stored_data)));
            ACTIVE_LOGIC.set(this, active_logic);
        } else {
            ACTIVE.set(this, !!exitData.active);
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

        /* register */
        ExitRegistry.set(props.access, this);
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

    get exitData() {
        return EXIT_DATA.get(this);
    }

    get active() {
        return ACTIVE.get(this);
    }

}
