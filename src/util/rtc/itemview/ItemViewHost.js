import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import EventManager from "/emcJS/util/event/EventManager.js";
import RTCClient from "/rtc/RTCClient.js";
import Savestate from "../../../savestate/Savestate.js";
import SettingsStorage from "../../../storage/SettingsStorage.js";
import {RTC_CONFIG} from "../config/RTCConfig.js";
import {
    DATA_CHANNEL_NAME, DEFAULT_STORAGES,
    MessageTypes
} from "./config/ItemViewConfig.js";

export default class ItemViewHost extends EventTarget {

    #syncedStorages = new Map();

    #isHosting = false;

    #rtcClient;

    #eventTargetManager = new EventTargetManager();

    #storageEventManager = new EventManager(false);

    constructor(port, syncedStorages = DEFAULT_STORAGES) {
        super();
        this.#rtcClient = new RTCClient(port, "/rtc", RTC_CONFIG, [DATA_CHANNEL_NAME]);

        this.registerSyncedStorages(syncedStorages);

        /* RTC */
        this.#eventTargetManager.set(`ready:${DATA_CHANNEL_NAME}`, () => {
            this.sendSync();
        });

        /* SAVESTATE */
        Savestate.addEventListener("load", () => {
            this.sendSync();
        });

        /* SETTINGS */
        SettingsStorage.addEventListener("change", (event) => {
            if (this.#rtcClient != null) {
                this.#rtcClient.send(DATA_CHANNEL_NAME, {
                    type: MessageTypes.SETTINGS,
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
        this.#storageEventManager.active = false;
        this.#isHosting = false;
        return true;
    }

    async host(name, pass, version, data) {
        const res = await this.#rtcClient.register(name, pass, version, data);
        if (res.success === true) {
            this.#eventTargetManager.switchTarget(this.#rtcClient);
            this.#storageEventManager.active = true;
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
        this.#storageEventManager.set(storage, "change", (event) => {
            this.#rtcClient.send(DATA_CHANNEL_NAME, {
                type: MessageTypes.UPDATE,
                category: name,
                data: event.data
            });
        });
        return storage;
    }

    sendSync() {
        if (this.#rtcClient != null) {
            const data = this.getSyncSavestate();
            this.#rtcClient.send(DATA_CHANNEL_NAME, {
                type: MessageTypes.SYNC,
                data,
                settings: SettingsStorage.getAll()
            });
        }
    }

    getSyncSavestate() {
        const data = {};
        for (const [name, storage] of this.#syncedStorages) {
            data[name] = storage.getAll();
        }
        return data;
    }

}
