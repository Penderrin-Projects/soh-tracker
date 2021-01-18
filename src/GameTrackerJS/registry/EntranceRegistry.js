import Registry from "/emcJS/data/Registry.js";

class EntranceRegistry extends Registry {

    get(key) {
        const res = super.get(key);
        if (res != null) {
            return res;
        }
        return super.get(key.split(" -> ").reverse().join(" -> "));
    }

}

export default new EntranceRegistry();
