import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import Savestate from "../../../savestate/Savestate.js";
import RTCPeer from "./RTCPeer.js";

const ITEM_STORAGE = Savestate.getStorage("items");

const VERSION = new WeakMap();
const REV_LOOKUP = new WeakMap();

export default class RTCPeerHost extends RTCPeer {

    #rtcClient;

    #clients = new Map();

    #eventTargetManager;

    constructor(rtcClient, username, version) {
        super(rtcClient, username);
        this.#rtcClient = rtcClient;

        VERSION.set(this, version);
        REV_LOOKUP.set(this, new Map());

        /* RTC */
        this.#eventTargetManager = new EventTargetManager(rtcClient);

        this.#eventTargetManager.set(["disconnect", "closed", "failed"], (event) => {
            const key = event.remoteID;
            const reverseLookup = REV_LOOKUP.get(this);
            let name = "";
            if (this.#clients.has(key)) {
                name = this.#clients.get(key);
                this.#clients.delete(key);
            } else {
                return;
            }
            Toast.warn(`Multiplayer: "${name}" left`);
            rtcClient.send("data", {
                type: "leave",
                data: name
            });
            reverseLookup.delete(name);
            const data = this.getUserList();
            rtcClient.send("data", {
                type: "room",
                data: data
            });
            /* roomupdate event */
            const ev = new Event("roomupdate");
            ev.data = data;
            this.dispatchEvent(ev);
        });

        /* SAVESTATE */
        ITEM_STORAGE.addEventListener("change", (event) => {
            if (!this.isMuted()) {
                this.#rtcClient.send("data", {
                    type: "event",
                    category: name,
                    data: event.data
                });
            }
        });
        Savestate.addEventListener("load", () => {
            rtcClient.send("data", {
                type: "state",
                data: this.getNetworkSafeState()
            });
        });
    }

    async close() {
        const res = await this.#rtcClient.unregister();
        if (!res.success) {
            await ModalDialog.alert("Error closing Room", "The Room could not be closed.");
            return false;
        }
        return true;
    }

    async disconnect() {
        await super.disconnect();
        /* clean up */
        const clients = CLIENTS.get(this);
        clients.clear();
        /* EVENTS */
        this.#eventTargetManager.clear();
    }

    getNetworkSafeState() {
        const data = ITEM_STORAGE.getAll();
        return {data};
    }

}
