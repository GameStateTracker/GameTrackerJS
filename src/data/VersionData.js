// frameworks
import FileLoader from "@emcjs/core/util/file/FileLoader.js";
import DateUtil from "@emcjs/core/util/date/DateUtil.js";
import {deepClone} from "@emcjs/core/util/helper/DeepClone.js";
import DeviceData from "@emcjs/core/data/DeviceData.js";

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
            if (resourceData.dev == "N") {
                res.version = `nightly [${resourceData.commit.slice(0, 7)}]`;
            } else {
                res.version = `DEV [${resourceData.commit.slice(0, 7)}]`;
            }
        } else {
            res.version = resourceData.version || 0;
        }
        res.date = DateUtil.format(new Date(resourceData.date), "D.M.Y h:m:s");
    } catch (err) {
        console.error("Could not load version file", err);
    }
    res.versionString = `${res.version} (${res.date})`;
    return res;
}

const APP_DATA = await getData();
console.groupCollapsed("APP VERSION");
console.log(JSON.stringify(APP_DATA, null, 4));
console.groupEnd("APP VERSION");
console.groupCollapsed("BROWSER DATA");
console.log(JSON.stringify(DeviceData, null, 4));
console.groupEnd("BROWSER DATA");

class VersionData extends EventTarget {

    get isDev() {
        return deepClone(APP_DATA.dev);
    }

    get version() {
        return deepClone(APP_DATA.version);
    }

    get date() {
        return deepClone(APP_DATA.date);
    }

    get versionString() {
        return deepClone(APP_DATA.versionString);
    }

    get browserData() {
        return deepClone(DeviceData);
    }

}

export default new VersionData();
