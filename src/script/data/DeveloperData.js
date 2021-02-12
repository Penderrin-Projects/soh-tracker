/* asym-import: off */
import FileLoader from "/emcJS/util/FileLoader.js";
import Helper from "/emcJS/util/Helper.js";
/* asym-import: on */

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
        return Helper.deepClone(DATA.owner);
    }

    get team() {
        return Helper.deepClone(DATA.team);
    }
    
    get contributors() {
        return Helper.deepClone(DATA.contributors);
    }

}

export default new DeveloperData();
