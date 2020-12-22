import FileData from "/emcJS/data/FileData.js";
import DefaultState from "/script/state/items/DefaultState.js";

let PROPS = null;

const CLAZZ = new Map();
const INSTANCES = new Map();

function initData() {
    if (PROPS == null) {
        PROPS = FileData.get("items");
    }
}

class ItemStates {

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
        if (ref == null) {
            throw new Error("the reference must not be null");
        }
        if (!this.has(ref)) {
            throw new ReferenceError("the reference does not exist");
        }
        if (!INSTANCES.has(ref)) {
            const props = PROPS[ref];
            if (!CLAZZ.has(props.type)) {
                const inst = new DefaultState(ref, props);
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

export default new ItemStates();
