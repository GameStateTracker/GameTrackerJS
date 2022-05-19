// frameworks
import FileLoader from "/emcJS/util/FileLoader.js";
import DateUtil from "/emcJS/util/DateUtil.js";
import Helper from "/emcJS/util/helper/Helper.js";

const REQUEST_OS_DATA = ["platform", "platformVersion"];

function getOSData() {
    return new Promise(resolve => {
        navigator.userAgentData.getHighEntropyValues(REQUEST_OS_DATA).then(resolve);
    });
}

async function getDeviceData() {
    const data = {
        vendor: navigator.vendor,
        userAgent: navigator.userAgent
    };
    if (navigator.userAgentData != null) {
        const uaData = navigator.userAgentData;
        data.platform = await getOSData();
        data.application = {
            mobile: uaData.mobile,
            brands: Helper.deepClone(uaData.brands)
        };
    }
    return data;
}

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
                res.version = `nightly [${resourceData.commit.slice(0, 7)}]`
            } else {
                res.version = `DEV [${resourceData.commit.slice(0, 7)}]`
            }
        } else {
            res.version = resourceData.version || 0;
        }
        res.date = DateUtil.convert(new Date(resourceData.date), "D.M.Y h:m:s");
    } catch (err) {
        console.error("Could not load version file", err);
    }
    res.versionString = `${res.version} (${res.date})`;
    return res;
}

const APP_DATA = await getData();
const BROWSER_DATA = await getDeviceData();
console.groupCollapsed("APP VERSION");
console.log(JSON.stringify(APP_DATA, null, 4));
console.groupEnd("APP VERSION");
console.groupCollapsed("BROWSER DATA");
console.log(JSON.stringify(BROWSER_DATA, null, 4));
console.groupEnd("BROWSER DATA");

class VersionData extends EventTarget {

    get isDev() {
        return Helper.deepClone(APP_DATA.dev);
    }

    get version() {
        return Helper.deepClone(APP_DATA.version);
    }

    get date() {
        return Helper.deepClone(APP_DATA.date);
    }

    get versionString() {
        return Helper.deepClone(APP_DATA.versionString);
    }

    get browserData() {
        return BROWSER_DATA;
    }

}

export default new VersionData();
