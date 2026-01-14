import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import Counter from "../../Counter.js";
import Savestate from "../../../savestate/Savestate.js";
import {DEFAULT_ITEM_VIEW_STORAGES as DEFAULT_STORAGES} from "../RTCConfig.js";

export default class MultiplayerPeer extends EventTarget {

    #syncedStorages = new Map();

    #rtcClient;

    #username;

    #muted = new Counter();

    #eventTargetManager = new EventTargetManager();

    constructor(rtcClient, username, syncedStorages = DEFAULT_STORAGES) {
        super();
        this.#rtcClient = rtcClient;
        this.#username = username;

        this.registerSyncedStorages(syncedStorages);

        /* RTC */
        this.#eventTargetManager.set("message:data", (event) => {
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
                    this.#syncedStorages.add(name, storage);
                }
            }
        } else if (typeof names === "string") {
            if (!this.#syncedStorages.has(names)) {
                const storage = this.#prepareStorage(names);
                this.#syncedStorages.add(names, storage);
            }
        }
    }

    #prepareStorage(name) {
        const storage = Savestate.getStorage(name);
        storage.addEventListener("change", (event) => {
            if (!this.isMuted()) {
                this.#rtcClient.send("data", {
                    type: "update",
                    category: name,
                    data: event.data
                });
            }
        });
        return storage;
    }

    async rtcMessageHandler(remoteID, msg) {
        if (msg.type == "update") {
            const storage = this.#syncedStorages.get(msg.category);
            if (storage != null) {
                this.mute();
                storage.setAll(msg.data);
                this.unmute();
            }
        }
    }

    getSyncSavestate() {
        const data = {};
        for (const [name, storage] of this.#syncedStorages) {
            data[name] = storage.getAll();
        }
        return data;
    }

    setSyncSavestate(data) {
        const stateData = {};
        for (const [name] of this.#syncedStorages) {
            if (name in data) {
                stateData[name] = data[name];
            }
        }
        Savestate.deserialize(stateData);
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
