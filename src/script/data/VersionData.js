/* asym-import: off */
import FileLoader from "/emcJS/util/FileLoader.js";
import DateUtil from "/emcJS/util/DateUtil.js";
import Helper from "/emcJS/util/Helper.js";
/* asym-import: on */

async function getData() {
    const res = {};
    const resourceData = await FileLoader.json("/version.json");
    res.dev = resourceData.dev;
    if (resourceData.dev) {
        res.version = `DEV [${resourceData.commit.slice(0, 7)}]`
    } else {
        res.version = resourceData.version;
    }
    res.date = DateUtil.convert(new Date(resourceData.date), "D.M.Y h:m:s");
    return res;
}

const DATA = await getData();

class VersionData extends EventTarget {

    get isDev() {
        return Helper.deepClone(DATA.dev);
    }

    get version() {
        return Helper.deepClone(DATA.version);
    }
    
    get date() {
        return Helper.deepClone(DATA.date);
    }

}

export default new VersionData();
