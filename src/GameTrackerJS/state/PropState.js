const PROPS = new WeakMap();

export default class PropState extends EventTarget {

    constructor(props = {}) {
        super();
        /* --- */
        PROPS.set(this, props);
    }

    get props() {
        return PROPS.get(this);
    }

}
