import Counter from "../../Counter.js";
import Savestate from "../../../savestate/Savestate.js";
import OptionsStorage from "../../../savestate/storage/OptionsStorage.js";

const SYNC_STORAGES = new Map();

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
        const data = {};
        for (const [name, storage] of SYNC_STORAGES) {
            data[name] = storage.getAll();
        }
        const options = OptionsStorage.getAll();
        return {
            data,
            options
        };
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

    static registerSyncedStorages(names) {
        if (Array.isArray(names)) {
            for (const name of names) {
                if (!SYNC_STORAGES.has(names)) {
                    const storage = Savestate.getStorage(name);
                    SYNC_STORAGES.add(name, storage);
                }
            }
        } else if (typeof names === "string") {
            if (!SYNC_STORAGES.has(names)) {
                const storage = Savestate.getStorage(names);
                SYNC_STORAGES.add(names, storage);
            }
        }
    }

}

{
    RTCPeer.registerSyncedStorages([
        "items",
        "locations",
        "exitBindings",
        "Savestate",
        "areaHints",
        "locationItems",
        "startItems",
        "options"
    ]);
}
