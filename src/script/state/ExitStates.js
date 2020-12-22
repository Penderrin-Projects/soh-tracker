import FileData from "/emcJS/data/FileData.js";
import DefaultState from "/script/state/world/exits/DefaultState.js";

let PROPS = null;
let EXIT_DATA = null;

const CLAZZ = new Map();
const INSTANCES = new Map();

function initData() {
    if (PROPS == null) {
        PROPS = FileData.get("world/marker/exit");
    }
    if (EXIT_DATA == null) {
        EXIT_DATA = FileData.get("world/exit");
    }
}

class ExitStates {

    register(type, clazz) {
        CLAZZ.set(type, clazz);
    }

    has(ref) {
        if (ref == null) {
            throw new Error("the reference must not be null");
        }
        initData();
        return PROPS[ref] != null;
    }

    get(ref) {
        const id = ref.split("/")[1];
        if (id == null) {
            throw new Error("the reference must not be null");
        }
        if (!this.has(id)) {
            throw new ReferenceError("the reference does not exist");
        }
        if (!INSTANCES.has(ref)) {
            const props = PROPS[id];
            const exitData = EXIT_DATA[props.access];
            if (!CLAZZ.has(props.type)) {
                const inst = new DefaultState(ref, props, exitData);
                INSTANCES.set(ref, inst);
                return inst;
            } else {
                const clazz = CLAZZ.get(props.type);
                const inst = new clazz(ref, props, exitData);
                INSTANCES.set(ref, inst);
                return inst;
            }
        }
        return INSTANCES.get(ref);
    }

}

export default new ExitStates();
