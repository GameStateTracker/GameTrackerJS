import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import Savestate from "../../../savestate/Savestate.js";
import MultiplayerPeer from "./MultiplayerPeer.js";

export default class MultiplayerHost extends MultiplayerPeer {

    #isHosting = false;

    #rtcClient;

    #eventTargetManager = new EventTargetManager();

    constructor(rtcClient, username, syncedStorages) {
        super(rtcClient, username, syncedStorages);
        this.#rtcClient = rtcClient;

        /* RTC */
        this.#eventTargetManager.set("ready:data", () => {
            this.sendSync();
        });
        this.#eventTargetManager.set("message:data", (event) => {
            const {
                remoteID, data
            } = event;
            this.rtcMessageHandler(remoteID, data);
        });

        /* SAVESTATE */
        Savestate.addEventListener("load", () => {
            this.sendSync();
        });
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

    isHosting() {
        return this.#isHosting;
    }

    sendSync() {
        if (this.#rtcClient != null) {
            const data = this.getSyncSavestate();
            this.#rtcClient.send("data", {
                type: "sync",
                data
            });
        }
    }

    async rtcMessageHandler(remoteID, msg) {
        if (msg.type == "sync") {
            this.sendSync();
        } else {
            super.rtcMessageHandler(remoteID, msg);
        }
    }

}
