const VALID_NAME = /[a-zA-Z0-9_\.\/\-]+/;
const REF = new WeakMap();
const PROPS = new WeakMap();

export default class DataState extends EventTarget {

    constructor(ref, props = {}) {
        if (typeof ref != "string") {
            throw new TypeError(`ref parameter must be of type "string" but was "${typeof ref}"`);
        }
        if (!ref) {
            throw new Error("ref parameter must not be empty");
        }
        if (!VALID_NAME.test(ref)) {
            throw new Error("ref parameter can only include the following characters [a-zA-Z0-9_./-]");
        }
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
