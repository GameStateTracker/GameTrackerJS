import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import MultiplayerPeer from "./MultiplayerPeer.js";

export default class MultiplayerClient extends MultiplayerPeer {

    #isConnected = false;

    #rtcClient;

    #eventTargetManager = new EventTargetManager();

    constructor(rtcClient, username, syncedStorages) {
        super(rtcClient, username, syncedStorages);
        this.#rtcClient = rtcClient;

        /* RTC */
        this.#eventTargetManager.set(["closed", "failed"], async (/* key */) => {
            this.#isConnected = false;
            const ev = new Event("disconnected");
            this.dispatchEvent(ev);
        });
    }

    connect(name, pass, version) {
        return new Promise((resolve) => {
            this.#rtcClient.connect(name, pass, version).then(async (res) => {
                if (res.success) {
                    this.#eventTargetManager.switchTarget(this.#rtcClient);
                    this.#isConnected = true;
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }

    async disconnect() {
        await this.#rtcClient.disconnect();
        this.#isConnected = false;
        /* EVENTS */
        this.#eventTargetManager.switchTarget(null);
    }

    isConnected() {
        return this.#isConnected;
    }

    async rtcMessageHandler(remoteID, msg) {
        if (msg.type == "sync") {
            this.setSyncSavestate(msg.data);
        } else {
            super.rtcMessageHandler(remoteID, msg);
        }
    }

}
