// frameworks
import LocalStorage from "/emcJS/data/storage/global/LocalStorage.js";
import {
    deepClone
} from "/emcJS/util/helper/DeepClone.js";

const SUPPORTER_URL = new URL("/patreon", location);
if (location.hostname == "localhost") {
    SUPPORTER_URL.port = 10001;
}

async function getData() {
    try {
        const r = await fetch(SUPPORTER_URL);
        if (r.status < 200 || r.status >= 300) {
            throw new Error(`error loading patreon data - status: ${r.status}`);
        }
        const supporters = await r.json();
        LocalStorage.set("supporters", supporters);
        return supporters;
    } catch (err) {
        console.error(err);
    }
    return LocalStorage.get("supporters", {});
}

const DATA = await getData();

class SupporterData extends EventTarget {

    get() {
        return deepClone(DATA);
    }

}

export default new SupporterData();
