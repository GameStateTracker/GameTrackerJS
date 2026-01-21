import {immute} from "/emcJS/data/Immutable.js";
import JSONCResource from "/emcJS/data/resource/file/JSONCResource.js";
import {
    isArrayOf, isDictOf, isObject, isStringNotEmpty
} from "/emcJS/util/helper/CheckType.js";

const DEFAULT_ICE = {
    iceTransportPolicy: "all", // all | relay
    iceServers: [
        {urls: "stun:stun.zidargs.net:18001"},
        {urls: "stun:stun.l.google.com:19302"},
        {
            urls: "turn:turn.zidargs.net:18001",
            credential: "fHNsIeqdgVcUAypvaxDVE6tywaMlP1fA",
            username: "iamgroot"
        }
    ]
};

const RTCConfig = {
    ice: DEFAULT_ICE,
    base: "/",
    services: {},
    storages: {}
};

function matchStun(value) {
    return isStringNotEmpty(value.urls) &&
        value.urls.startsWith("stun:");
}

function matchTurn(value) {
    return isStringNotEmpty(value.urls) &&
        value.urls.startsWith("turn:") &&
        isStringNotEmpty(value.credential) &&
        isStringNotEmpty(value.username);
}

function matchIceServers(value) {
    if (isDictOf(value, matchStun)) {
        return true;
    }
    if (isDictOf(value, matchTurn)) {
        return true;
    }
    return false;
}

try {
    const rawData = await JSONCResource.get("/config/rtcconfig.json");
    const data = rawData.get();
    if (isStringNotEmpty(data.base)) {
        RTCConfig.base = data.base;
    }
    if (isObject(data.services)) {
        for (const name in data.services) {
            if (isStringNotEmpty(data.services[name])) {
                RTCConfig.services[name] = data.services[name];
            }
        }
    }
    if (isObject(data.storages)) {
        for (const name in data.storages) {
            if (isArrayOf(data.storages[name], isStringNotEmpty)) {
                RTCConfig.storages[name] = data.storages[name];
            }
        }
    }
    if (data.ice != null) {
        if (isStringNotEmpty(data.ice.iceTransportPolicy)) {
            RTCConfig.ice.iceTransportPolicy = data.ice.iceTransportPolicy;
        }
        if (isArrayOf(data.ice.iceServers, matchIceServers)) {
            RTCConfig.ice.iceServers = data.ice.iceServers;
        }
    }
} catch {
    // ignore
}

export default immute(RTCConfig);

