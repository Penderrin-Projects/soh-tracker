import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import LogicFunctionExecutor from "../../util/LogicFunctionExecutor.js";
import DataState from "./DataState.js";

const VISIBLE = new WeakMap();
const VISIBLE_LOGIC = new WeakMap();

export default class VisibilityState extends DataState {

    constructor(ref, props) {
        super(ref, props);
        /* VISIBLE */
        if (typeof props.visible == "object") {
            const visible_logic = LogicCompiler.compile(props.visible);
            const value = LogicFunctionExecutor.execute(visible_logic);
            VISIBLE.set(this, value);
            VISIBLE_LOGIC.set(this, visible_logic);
        } else {
            VISIBLE.set(this, !!props.visible);
        }
        /* EVENTS */
        LogicFunctionExecutor.addEventListener("change", event => {
            const visible_logic = VISIBLE_LOGIC.get(this);
            if (typeof visible_logic == "function") {
                const visible = VISIBLE.get(this);
                const value = LogicFunctionExecutor.execute(visible_logic);
                if (visible != value) {
                    VISIBLE.set(this, value);
                    const event = new Event("visible");
                    event.data = value;
                    this.dispatchEvent(event);
                }
            }
        });
    }

    get visible() {
        return !!VISIBLE.get(this);
    }

}
