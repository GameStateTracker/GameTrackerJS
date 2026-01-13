import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import RTCClient from "/rtc/RTCClient.js";
import Savestate from "../../../savestate/Savestate.js";
import OptionsStorage from "../../../savestate/storage/OptionsStorage.js";
import SettingsStorage from "../../../storage/SettingsStorage.js";
import {RTC_CONFIG} from "../RTCConfig.js";

const ITEM_STORAGE = Savestate.getStorage("items");

export default class ItemViewClient extends EventTarget {

    #isConnected = false;

    #rtcClient;

    #eventTargetManager = new EventTargetManager();

    constructor(port) {
        super();
        this.#rtcClient = new RTCClient(port, "/rtc", RTC_CONFIG, ["data"]);
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
        if (msg.type == "items") {
            ITEM_STORAGE.setAll(msg.data);
        } else if (msg.type == "options") {
            OptionsStorage.setAll(msg.data);
        } else if (msg.type == "settings") {
            SettingsStorage.setAll(msg.data);
        } else if (msg.type == "sync") {
            const {
                items, options, settings
            } = msg.data;
            SettingsStorage.deserialize(settings);
            OptionsStorage.deserialize(options);
            ITEM_STORAGE.deserialize(items);
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

}
