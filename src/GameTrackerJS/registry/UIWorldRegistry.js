import ClassRegister from "/emcJS/util/ClassRegister.js";

const CATEGORIES = new Map();

export default class UIWorldRegistry extends ClassRegister {

    create(type, ref = "") {
        const el = super.create(type);
        el.ref = ref;
        return el;
    }

    static set(category, registry) {
        if (!(registry instanceof UIWorldRegistry)) {
            throw new TypeError("registry has to be a UIWorldRegistry");
        }
        if (CATEGORIES.has(category)) {
            throw new Error(`category "${category}" already exists in UIWorldRegistry`);
        }
        CATEGORIES.set(category, registry);
    }

    static get(category) {
        return CATEGORIES.get(category);
    }

}
