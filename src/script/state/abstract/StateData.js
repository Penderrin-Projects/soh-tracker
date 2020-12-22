import WorldRegistry from "/script/registries/WorldRegistry.js";

const REF = new WeakMap();
const PROPS = new WeakMap();

export default class StateData extends EventTarget {

    constructor(ref, props) {
        super();
        /* --- */
        REF.set(this, ref);
        PROPS.set(this, props);
        /* register */
        WorldRegistry.set(ref, this);
    }

    get ref() {
        return REF.get(this);
    }

    get props() {
        return PROPS.get(this);
    }

}
