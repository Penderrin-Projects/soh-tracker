// frameworks
import FileLoader from "/emcJS/util/file/FileLoader.js";
import {
    deepClone
} from "/emcJS/util/helper/DeepClone.js";

async function getData() {
    const res = {};
    const resourceData = await FileLoader.json("/devs.json");
    res.owner = resourceData.owner;
    res.team = resourceData.team;
    res.contributors = resourceData.contributors;
    return res;
}

const DATA = await getData();

class DeveloperData extends EventTarget {

    get owner() {
        return deepClone(DATA.owner);
    }

    get team() {
        return deepClone(DATA.team);
    }

    get contributors() {
        return deepClone(DATA.contributors);
    }

}

export default new DeveloperData();
