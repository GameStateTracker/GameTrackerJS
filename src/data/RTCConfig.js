import {immute} from "/emcJS/data/Immutable.js";
import JSONCResource from "/emcJS/data/resource/file/JSONCResource.js";
import {
    isArrayOf, isDictOf, isStringNotEmpty
} from "/emcJS/util/helper/CheckType.js";

const RTCConfig = {
    ice: {
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
    },
    base: "/",
    services: {
        multiplayer: "lobby",
        itemview: "itemview"
    }
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
    const rawData = await JSONCResource.get("/database/rtcconfig.json");
    const data = rawData.get();
    if (isStringNotEmpty(data.base)) {
        RTCConfig.base = data.base;
    }
    if (data.services != null) {
        if (isStringNotEmpty(data.services.multiplayer)) {
            RTCConfig.services.multiplayer = data.services.multiplayer;
        }
        if (isStringNotEmpty(data.services.itemview)) {
            RTCConfig.services.itemview = data.services.itemview;
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

