import FileData from "/emcJS/data/FileData.js";
import AbstractLocationState from "/script/state/world/AbstractLocationState.js";

let DATA = null;

const CLAZZ = new Map();
const INSTANCES = new Map();

function initData() {
    if (DATA == null) {
        DATA = FileData.get("world/marker");
    }
}

class LocationStates {

    register(type, clazz) {
        CLAZZ.set(type, clazz);
    }

    has(ref) {
        if (ref == null) {
            throw new Error("the reference must not be null");
        }
        initData();
        return DATA[ref] != null;
    }

    get(ref) {
        if (ref == null) {
            throw new Error("the reference must not be null");
        }
        if (!this.has(ref)) {
            throw new ReferenceError("the location reference does not exist");
        }
        if (!INSTANCES.has(ref)) {
            const props = DATA[ref];
            if (!CLAZZ.has(props.type)) {
                const inst = new AbstractLocationState(ref, props);
                INSTANCES.set(ref, inst);
                return inst;
            } else {
                const clazz = CLAZZ.get(props.type);
                const inst = new clazz(ref, props);
                INSTANCES.set(ref, inst);
                return inst;
            }
        }
        return INSTANCES.get(ref);
    }

}

export default new LocationStates();
