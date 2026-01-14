import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import RTCClient from "/rtc/RTCClient.js";
import Savestate from "../../../savestate/Savestate.js";
import SettingsStorage from "../../../storage/SettingsStorage.js";
import {
    DEFAULT_ITEM_VIEW_STORAGES as DEFAULT_STORAGES, RTC_CONFIG
} from "../RTCConfig.js";

export default class ItemViewHost extends EventTarget {

    #syncedStorages = new Map();

    #isHosting = false;

    #rtcClient;

    #eventTargetManager = new EventTargetManager();

    constructor(port, syncedStorages = DEFAULT_STORAGES) {
        super();
        this.#rtcClient = new RTCClient(port, "/rtc", RTC_CONFIG, ["data"]);

        this.registerSyncedStorages(syncedStorages);

        /* RTC */
        this.#eventTargetManager.set("ready:data", () => {
            this.sendSync();
        });

        /* SAVESTATE */
        Savestate.addEventListener("load", () => {
            this.sendSync();
        });

        /* SETTINGS */
        SettingsStorage.addEventListener("change", (event) => {
            if (this.#rtcClient != null) {
                this.#rtcClient.send("data", {
                    type: "settings",
                    data: event.data
                });
            }
        });
    }

    isHosting() {
        return this.#isHosting;
    }

    async close() {
        const res = await this.#rtcClient.unregister();
        if (!res.success) {
            await ModalDialog.alert("Error unregistering Host", "The Host could not be closed.\nThe token is possibly already removed.");
            return false;
        }
        await this.#rtcClient.disconnect();
        this.#eventTargetManager.switchTarget(null);
        this.#isHosting = false;
        return true;
    }

    async host(name, pass, version, data) {
        const res = await this.#rtcClient.register(name, pass, version, data);
        if (res.success === true) {
            this.#eventTargetManager.switchTarget(this.#rtcClient);
            this.#isHosting = true;
            return true;
        } else {
            await ModalDialog.alert("Error registering Host", "An error occured while registering your instance.\nThe token is possibly already in use.");
            return false;
        }
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

    sendSync() {
        if (this.#rtcClient != null) {
            const data = {};
            for (const [name, storage] of this.#syncedStorages) {
                data[name] = storage.getAll();
            }
            this.#rtcClient.send("data", {
                type: "sync",
                data,
                settings: SettingsStorage.getAll()
            });
        }
    }

}
