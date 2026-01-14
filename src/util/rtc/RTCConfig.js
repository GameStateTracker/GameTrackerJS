export const RTC_CONFIG = {
    iceTransportPolicy: "all", // all | relay
    iceServers: [{urls: "stun:stun.zidargs.net:18001"}, {urls: "stun:stun.l.google.com:19302"}, {
        urls: "turn:turn.zidargs.net:18001",
        credential: "fHNsIeqdgVcUAypvaxDVE6tywaMlP1fA",
        username: "iamgroot"
    }]
};

export const DEFAULT_ITEM_VIEW_STORAGES = [
    "items",
    "options"
];

export const  DEFAULT_MULTIPLAYER_STORAGES = [
    "items",
    "locations",
    "exitBindings",
    "areaHints",
    "locationItems",
    "startItems",
    "options"
];
