const REF = new WeakMap();
const PROPS = new WeakMap();

export default class DataState extends EventTarget {

    constructor(ref, props = {}) {
        super();
        /* --- */
        REF.set(this, ref);
        PROPS.set(this, props);
    }

    get ref() {
        return REF.get(this);
    }

    get props() {
        return PROPS.get(this);
    }

}
