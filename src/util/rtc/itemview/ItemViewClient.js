import EventTargetManager from "@emcjs/core/util/event/EventTargetManager.js";
import RTCClient from "rtcclient/RTCClient.js";
import Savestate from "../../../savestate/Savestate.js";
import SettingsStorage from "../../../storage/SettingsStorage.js";
import RTCConfig from "../../../data/RTCConfig.js";
import {
    DATA_CHANNEL_NAME,
    DEFAULT_STORAGES,
    MessageTypes
} from "./config/ItemViewConfig.js";

const RTC_CONFIG = RTCConfig.ice;

const ENDPOINT_BASE = RTCConfig.base;

const ENDPOINT_NAME = RTCConfig.services.itemview ?? "itemview";

const SYNCED_STORAGES = RTCConfig.storages.itemview ?? DEFAULT_STORAGES;

// TODO add EventManager activated when player is joined
// should contain all savestate related events
export default class ItemViewClient extends EventTarget {

    #syncedStorages = new Map();

    #isConnected = false;

    #rtcClient;

    #eventTargetManager = new EventTargetManager();

    constructor(port) {
        super();
        this.#rtcClient = new RTCClient(port, ENDPOINT_BASE, ENDPOINT_NAME, RTC_CONFIG, [DATA_CHANNEL_NAME]);

        this.registerSyncedStorages(SYNCED_STORAGES);

        /* RTC */
        this.#eventTargetManager.set(["closed", "failed"], async (/* key */) => {
            this.#isConnected = false;
            const ev = new Event("disconnected");
            this.dispatchEvent(ev);
        });
        this.#eventTargetManager.set(`message:${DATA_CHANNEL_NAME}`, (event) => {
            const {
                remoteId, data
            } = event;
            this.rtcMessageHandler(remoteId, data);
        });
    }

    isConnected() {
        return this.#isConnected;
    }

    async disconnect() {
        await this.#rtcClient.disconnect();
        this.#isConnected = false;
        /* EVENTS */
        this.#eventTargetManager.disconnect();
    }

    async rtcMessageHandler(remoteId, msg) {
        if (msg.type == MessageTypes.UPDATE) {
            const storage = this.#syncedStorages.get(msg.category);
            if (storage != null) {
                storage.setAll(msg.data);
            }
        } else if (msg.type == MessageTypes.SETTINGS) {
            SettingsStorage.setAll(msg.data);
        } else if (msg.type == MessageTypes.ACCESS) {
            const ev = new Event("access");
            ev.value = msg.data;
            this.dispatchEvent(ev);
        } else if (msg.type == MessageTypes.SYNC) {
            SettingsStorage.deserialize(msg.settings);
            this.setSyncSavestate(msg.data);
            const ev = new Event("access");
            ev.value = msg.access;
            this.dispatchEvent(ev);
        }
    }

    connect(name, pass, version) {
        return new Promise((resolve, reject) => {
            try {
                this.#rtcClient.connect(name, pass, version).then(async (res) => {
                    if (res.success) {
                        this.#eventTargetManager.switchTarget(this.#rtcClient);
                        this.#isConnected = true;
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                });
            } catch (err) {
                reject(err);
            }
        });
    }

    registerSyncedStorages(names) {
        if (Array.isArray(names)) {
            for (const name of names) {
                if (!this.#syncedStorages.has(name)) {
                    const storage = Savestate.getStorage(name);
                    this.#syncedStorages.set(name, storage);
                }
            }
        } else if (typeof names === "string") {
            if (!this.#syncedStorages.has(names)) {
                const storage = Savestate.getStorage(name);
                this.#syncedStorages.set(names, storage);
            }
        }
    }

    setSyncSavestate(data) {
        const stateData = {data: {}};
        for (const [name] of this.#syncedStorages) {
            if (name in data) {
                stateData.data[name] = data[name];
            }
        }
        Savestate.deserialize(stateData);
    }

}
