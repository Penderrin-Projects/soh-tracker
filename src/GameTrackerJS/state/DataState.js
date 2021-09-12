import PropState from "./PropState.js";

const VALID_NAME = /[a-zA-Z0-9_\.\/\-]+/;
const REF = new WeakMap();

export default class DataState extends PropState {

    constructor(ref, props) {
        if (typeof ref != "string") {
            throw new TypeError(`ref parameter must be of type "string" but was "${typeof ref}"`);
        }
        if (!ref) {
            throw new Error("ref parameter must not be empty");
        }
        if (!VALID_NAME.test(ref)) {
            throw new Error("ref parameter can only include the following characters [a-zA-Z0-9_./-]");
        }
        super(props);
        /* --- */
        REF.set(this, ref);
    }

    get ref() {
        return REF.get(this);
    }

}
