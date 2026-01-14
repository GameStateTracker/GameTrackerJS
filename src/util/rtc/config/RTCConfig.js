
// TODO create listentry editor for using custom stun/turn server config
export const RTC_CONFIG = {
    iceTransportPolicy: "all", // all | relay
    iceServers: [{urls: "stun:stun.zidargs.net:18001"}, {urls: "stun:stun.l.google.com:19302"}, {
        urls: "turn:turn.zidargs.net:18001",
        credential: "fHNsIeqdgVcUAypvaxDVE6tywaMlP1fA",
        username: "iamgroot"
    }]
};
