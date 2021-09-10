const PROPDATA = new WeakMap();
const DEFAULT_STATE = new WeakMap();
const CLASSES = new WeakMap();
const INSTANCES = new WeakMap();

export default class StateManager {

    constructor(DefaultState, props) {
        if (new.target === StateManager) {
            throw new TypeError("can not construct abstract class");
        }
        if (DefaultState == null) {
            throw new Error("DefaultState class must not be null");
        }
        /* --- */
        DEFAULT_STATE.set(this, DefaultState);
        PROPDATA.set(this, props);
        CLASSES.set(this, new Map());
        INSTANCES.set(this, new Map());
    }

    register(type, CustomState) {
        const classes = CLASSES.get(this);
        classes.set(type, CustomState);
    }

    has(ref) {
        if (ref == null) {
            throw new Error("the reference must not be null");
        }
        const propdata = PROPDATA.get(this);
        return propdata[ref] != null;
    }

    get(ref) {
        if (ref == null) {
            throw new Error("the reference must not be null");
        }
        const instances = INSTANCES.get(this);
        if (instances.has(ref)) {
            return instances.get(ref);
        }
        const propdata = PROPDATA.get(this);
        const props = propdata[ref];
        if (props != null) {
            const classes = CLASSES.get(this);
            if (classes.has(props.type)) {
                const CustomState = classes.get(props.type);
                const inst = this.createState(CustomState, ref, props);
                instances.set(ref, inst);
                return inst;
            } else {
                const DefaultState = DEFAULT_STATE.get(this);
                const inst = this.createState(DefaultState, ref, props);
                instances.set(ref, inst);
                return inst;
            }
        }
    }

    createState(StateClass, ref, props) {
        return new StateClass(ref, props);
    }

    getAll() {
        const instances = INSTANCES.get(this);
        const res = {};
        for (const [key, value] of instances) {
            res[key] = value;
        }
        return res;
    }

}
