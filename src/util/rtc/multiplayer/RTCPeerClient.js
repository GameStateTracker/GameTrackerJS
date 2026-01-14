import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import Savestate from "../../../savestate/Savestate.js";
import MultiplayerPeer from "./MultiplayerPeer.js";

const STORAGES = {
    // GameTrackerJS
    filter: Savestate.getStorage("filter")
};

export default class RTCPeerClient extends MultiplayerPeer {

    #eventTargetManager;

    constructor(rtcClient, username, version) {
        super(rtcClient, username, version);

        /* RTC */
        this.#eventTargetManager = new EventTargetManager(rtcClient);
        this.#eventTargetManager.set(["closed", "failed"], async (/* key */) => {
            await ModalDialog.alert("Disconnected from host", "The connection to the host closed unexpectedly.");
        });
        this.mute();
    }

    async disconnect() {
        await super.disconnect();
        /* EVENTS */
        this.#eventTargetManager.clear();
    }

    async rtcMessageHandler(remoteID, msg) {
        if (msg.type == "join") {
            Toast.info(`Multiplayer: "${msg.data}" joined`);
        } else if (msg.type == "synced") {
            this.unmute();
        } else if (msg.type == "leave") {
            Toast.warn(`Multiplayer: "${msg.data}" left`);
        } else if (msg.type == "kick") {
            ModalDialog.alert("You have been kicked", `You have been kicked by the host: ${msg.data ? msg.data : "no reason provided"}.`);
        } else if (msg.type == "room") {
            /* roomupdate event */
            const ev = new Event("roomupdate");
            ev.data = msg.data;
            this.dispatchEvent(ev);
        } else if (msg.type == "state") {
            this.mute();
            const filter = STORAGES.filter.getAll();
            await Savestate.deserialize({
                data: {
                    ...msg.data.data,
                    filter
                },
                meta: {"init_window_shown": true}
            });
            this.unmute();
        } else {
            await super.rtcMessageHandler(remoteID, msg);
        }
    }

}
