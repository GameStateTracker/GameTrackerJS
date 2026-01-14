import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import RTCClient from "/rtc/RTCClient.js";
import Savestate from "../../../savestate/Savestate.js";
import SettingsStorage from "../../../storage/SettingsStorage.js";
import {
    DEFAULT_ITEM_VIEW_STORAGES as DEFAULT_STORAGES, RTC_CONFIG
} from "../RTCConfig.js";

export default class ItemViewClient extends EventTarget {

    #syncedStorages = new Map();

    #isConnected = false;

    #rtcClient;

    #eventTargetManager = new EventTargetManager();

    constructor(port, syncedStorages = DEFAULT_STORAGES) {
        super();
        this.#rtcClient = new RTCClient(port, "/rtc", RTC_CONFIG, ["data"]);

        this.registerSyncedStorages(syncedStorages);

        /* RTC */
        this.#eventTargetManager.set(["closed", "failed"], async (/* key */) => {
            this.#isConnected = false;
            const ev = new Event("disconnected");
            this.dispatchEvent(ev);
        });
        this.#eventTargetManager.set("message:data", (event) => {
            const {
                remoteID, data
            } = event;
            this.rtcMessageHandler(remoteID, data);
        });
    }

    isConnected() {
        return this.#isConnected;
    }

    async disconnect() {
        await this.#rtcClient.disconnect();
        this.#isConnected = false;
        /* EVENTS */
        this.#eventTargetManager.switchTarget(null);
    }

    async rtcMessageHandler(remoteID, msg) {
        if (msg.type == "update") {
            const storage = this.#syncedStorages.get(msg.category);
            if (storage != null) {
                storage.setAll(msg.data);
            }
        } else if (msg.type == "settings") {
            SettingsStorage.setAll(msg.data);
        } else if (msg.type == "sync") {
            SettingsStorage.deserialize(msg.settings);
            const stateData = {};
            for (const [name] of this.#syncedStorages) {
                if (name in msg.data) {
                    stateData[name] = msg.data[name];
                }
            }
            Savestate.deserialize(stateData);
        }
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

    registerSyncedStorages(names) {
        if (Array.isArray(names)) {
            for (const name of names) {
                if (!this.#syncedStorages.has(name)) {
                    const storage = Savestate.getStorage(name);
                    this.#syncedStorages.add(name, storage);
                }
            }
        } else if (typeof names === "string") {
            if (!this.#syncedStorages.has(names)) {
                const storage = Savestate.getStorage(name);
                this.#syncedStorages.add(names, storage);
            }
        }
    }

}
