import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import DataState from "./DataState.js";
import SavestateHandler from "../../savestate/SavestateHandler.js";
import OptionsStorage from "../../storage/OptionsStorage.js";
import SettingsStorage from "../../storage/SettingsStorage.js";

function valueGetter(key) {
    return this.get(key);
}

const VISIBLE = new WeakMap();
const VISIBLE_LOGIC = new WeakMap();

export default class VisibilityState extends DataState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        const stored_data = new Map(Object.entries({
            ...SavestateHandler.getAll(""),
            ...SettingsStorage.getAll(),
            ...OptionsStorage.getAll()
        }));
        /* VISIBLE */
        if (typeof props.visible == "object") {
            const visible_logic = LogicCompiler.compile(props.visible);
            VISIBLE.set(this, !!visible_logic(valueGetter.bind(stored_data)));
            VISIBLE_LOGIC.set(this, visible_logic);
        } else {
            VISIBLE.set(this, !!props.visible);
        }
        /* EVENTS */
        SavestateHandler.addEventListener("change", event => {
            const data = new Map(Object.entries({
                ...SavestateHandler.getAll(""),
                ...SettingsStorage.getAll(),
                ...OptionsStorage.getAll()
            }));
            this./*#*/__calculateVisibility(data);
        });
        SettingsStorage.addEventListener("change", event => {
            const data = new Map(Object.entries({
                ...SavestateHandler.getAll(""),
                ...SettingsStorage.getAll(),
                ...OptionsStorage.getAll()
            }));
            this./*#*/__calculateVisibility(data);
        });
        OptionsStorage.addEventListener("change", event => {
            const data = new Map(Object.entries({
                ...SavestateHandler.getAll(""),
                ...SettingsStorage.getAll(),
                ...OptionsStorage.getAll()
            }));
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
