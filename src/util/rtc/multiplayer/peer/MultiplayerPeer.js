import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import EventManager from "/emcJS/util/event/EventManager.js";
import RTCConfig from "../../../../data/RTCConfig.js";
import Counter from "../../../Counter.js";
import Savestate from "../../../../savestate/Savestate.js";
import {
    DATA_CHANNEL_NAME, DEFAULT_STORAGES
} from "../config/MultiplayerConfig.js";

const FILTER_STORAGE = Savestate.getStorage("filter");

const SYNCED_STORAGES = RTCConfig.storages.multiplayer ?? DEFAULT_STORAGES;

export default class MultiplayerPeer extends EventTarget {

    #syncedStorages = new Map();

    #rtcClient;

    #roomName;

    #username;

    #muted = new Counter();

    #eventTargetManager = new EventTargetManager();

    #savestateEventManager = new EventManager();

    constructor(rtcClient, roomName, username) {
        super();
        this.#rtcClient = rtcClient;
        this.#roomName = roomName;
        this.#username = username;

        this.registerSyncedStorages(SYNCED_STORAGES);

        /* RTC */
        this.#eventTargetManager.switchTarget(this.#rtcClient);
        this.#eventTargetManager.set(`message:${DATA_CHANNEL_NAME}`, (event) => {
            const {
                remoteID, data
            } = event;
            this.rtcMessageHandler(remoteID, data);
        });
    }

    registerSyncedStorages(names) {
        if (Array.isArray(names)) {
            for (const name of names) {
                if (!this.#syncedStorages.has(name)) {
                    const storage = this.#prepareStorage(name);
                    this.#syncedStorages.set(name, storage);
                }
            }
        } else if (typeof names === "string") {
            if (!this.#syncedStorages.has(names)) {
                const storage = this.#prepareStorage(names);
                this.#syncedStorages.set(names, storage);
            }
        }
    }

    #prepareStorage(name) {
        const storage = Savestate.getStorage(name);
        this.#savestateEventManager.set(storage, "change", (event) => {
            if (!this.isMuted()) {
                this.#rtcClient.send(DATA_CHANNEL_NAME, {
                    type: "update",
                    category: name,
                    data: event.data
                });
            }
        });
        return storage;
    }

    disconnect() {
        this.#eventTargetManager.disconnect();
        this.#eventTargetManager.reset();
        this.#savestateEventManager.clear();
    }

    async rtcMessageHandler(remoteID, msg) {
        if (msg.type == "update") {
            const storage = this.#syncedStorages.get(msg.category);
            if (storage != null) {
                this.mute();
                storage.setAll(msg.data);
                this.unmute();
                return true;
            }
        }
        return false;
    }

    getSyncSavestate() {
        const data = {};
        for (const [name, storage] of this.#syncedStorages) {
            data[name] = storage.getAll();
        }
        return data;
    }

    setSyncSavestate(data) {
        const filter = FILTER_STORAGE.getAll();
        const stateData = {
            data: {filter},
            meta: {"init_window_shown": true}
        };
        for (const [name] of this.#syncedStorages) {
            if (name in data) {
                stateData.data[name] = data[name];
            }
        }
        this.mute();
        Savestate.deserialize(stateData);
        this.unmute();
    }

    get roomName() {
        return this.#roomName;
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

}
