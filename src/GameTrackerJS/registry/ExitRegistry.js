/* asym-import: off */
import Registry from "/emcJS/data/Registry.js";
/* asym-import: on */

class ExitRegistry extends Registry {

    get(key) {
        const res = super.get(key);
        if (res != null) {
            return res;
        }
        return super.get(key.split(" -> ").reverse().join(" -> "));
    }

}

export default new ExitRegistry();
