import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import RTCClient from "/rtc/RTCClient.js";
import Savestate from "../../../savestate/Savestate.js";
import OptionsStorage from "../../../savestate/storage/OptionsStorage.js";
import SettingsStorage from "../../../storage/SettingsStorage.js";
import {RTC_CONFIG} from "../RTCConfig.js";

const ITEM_STORAGE = Savestate.getStorage("items");

export default class ItemViewHost extends EventTarget {

    #isHosting = false;

    #rtcClient;

    #eventTargetManager = new EventTargetManager();

    constructor(port) {
        super();
        this.#rtcClient = new RTCClient(port, "/rtc", RTC_CONFIG, ["data"]);

        /* RTC */
        this.#eventTargetManager.set("ready:data", () => {
            if (this.#rtcClient != null) {
                this.#rtcClient.send("data", {
                    type: "sync",
                    data: {
                        items: ITEM_STORAGE.getAll(),
                        options: OptionsStorage.getAll(),
                        settings: SettingsStorage.getAll()
                    }
                });
            }
        });

        /* SAVESTATE */
        ITEM_STORAGE.addEventListener("change", (event) => {
            if (this.#rtcClient != null) {
                this.#rtcClient.send("data", {
                    type: "items",
                    data: event.data
                });
            }
        });
        OptionsStorage.addEventListener("change", (event) => {
            if (this.#rtcClient != null) {
                this.#rtcClient.send("data", {
                    type: "options",
                    data: event.data
                });
            }
        });
        SettingsStorage.addEventListener("change", (event) => {
            if (this.#rtcClient != null) {
                this.#rtcClient.send("data", {
                    type: "settings",
                    data: event.data
                });
            }
        });
        Savestate.addEventListener("load", () => {
            if (this.#rtcClient != null) {
                this.#rtcClient.send("data", {
                    type: "sync",
                    data: {
                        items: ITEM_STORAGE.getAll(),
                        options: OptionsStorage.getAll(),
                        settings: SettingsStorage.getAll()
                    }
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
            await ModalDialog.alert("Error closing Room", "The Room could not be closed.");
            return false;
        }
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
            await ModalDialog.alert("Error registering to Lobby", "An error occured while registering your instance.\nThe name is possibly already in use.");
            return false;
        }
    }

}
