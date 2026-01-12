import Counter from "../../Counter.js";
import Savestate from "../../../savestate/Savestate.js";
import OptionsStorage from "../../../savestate/storage/OptionsStorage.js";

const ITEM_STORAGE = Savestate.getStorage("items");

export default class RTCPeer extends EventTarget {

    #rtcClient;

    #username;

    #muted = new Counter();

    constructor(rtcClient, username) {
        super();
        this.#rtcClient = rtcClient;
        this.#username = username;

        /* RTC */
        this.#rtcClient.setMessageHandler("data", (key, msg) => {
            this.rtcMessageHandler(key, msg);
        });

        /* STORAGES */
        for (const [name, storage] of SYNC_STORAGES) {
            storage.addEventListener("change", (event) => {
                if (!this.isMuted()) {
                    this.#rtcClient.send("data", {
                        type: "event",
                        category: name,
                        data: event.data
                    });
                }
            });
        }
    }

    getNetworkSafeState() {
        const data = ITEM_STORAGE.getAll();
        return {data};
    }

    get username() {
        return this.#username;
    }

    mute() {
        this.#muted.add();
    }

    unmute() {
        this.#muted.sub();
    }

    isMuted() {
        return !!this.#muted.value;
    }

    async disconnect() {
        await this.#rtcClient.disconnect();
    }

    async rtcMessageHandler(key, msg) {
        if (msg.type == "event") {
            const storage = SYNC_STORAGES.get(msg.category);
            if (storage != null) {
                this.mute();
                storage.setAll(msg.data);
                this.unmute();
                return true;
            }
        }
        return false;
    }

}
