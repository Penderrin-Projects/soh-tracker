const REF = new WeakMap();
const PROPS = new WeakMap();

export default (CLAZZ) => class extends CLAZZ {

    constructor(ref, props, ...args) {
        super(...args);
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
