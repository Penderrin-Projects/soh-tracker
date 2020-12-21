import FileData from "/emcJS/data/FileData.js";
import DefaultState from "/script/state/world/subareas/DefaultState.js";

let PROPS = null;
let AREA_DATA = null;

const CLAZZ = new Map();
const INSTANCES = new Map();

function initData() {
    if (PROPS == null) {
        PROPS = FileData.get("world/marker/subarea");
    }
    if (AREA_DATA == null) {
        AREA_DATA = FileData.get("world/subarea");
    }
}

class SubAreaStates {

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
            throw new ReferenceError("the location reference does not exist");
        }
        if (!INSTANCES.has(ref)) {
            const props = PROPS[ref];
            const areaData = AREA_DATA[ref];
            if (!CLAZZ.has(props.type)) {
                const inst = new DefaultState(ref, props, areaData);
                INSTANCES.set(ref, inst);
                return inst;
            } else {
                const clazz = CLAZZ.get(props.type);
                const inst = new clazz(ref, props, areaData);
                INSTANCES.set(ref, inst);
                return inst;
            }
        }
        return INSTANCES.get(ref);
    }

}

export default new SubAreaStates();
