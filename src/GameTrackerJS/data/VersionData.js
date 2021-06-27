/* asym-import: off */
import FileLoader from "/emcJS/util/FileLoader.js";
import DateUtil from "/emcJS/util/DateUtil.js";
import Helper from "/emcJS/util/Helper.js";
/* asym-import: on */

async function getData() {
    const res = {
        dev: false,
        version: 0,
        date: new Date(0),
        versionString: ""
    };
    try {
        const resourceData = await FileLoader.json("/version.json");
        res.dev = resourceData.dev;
        if (resourceData.dev) {
            res.version = `DEV [${resourceData.commit.slice(0, 7)}]`
        } else {
            res.version = resourceData.version || 0;
        }
        res.date = DateUtil.convert(new Date(resourceData.date), "D.M.Y h:m:s");
    } catch(err) {
        console.error("Could not load version file", err);
    }
    res.versionString = `${res.version} (${res.date})`;
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

    get versionString() {
        return Helper.deepClone(DATA.versionString);
    }

    get userAgent() {
        return navigator.userAgent;
    }

}

export default new VersionData();
