import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";
import MultiplayerPeer from "./MultiplayerPeer.js";
import {
    DATA_CHANNEL_NAME, MessageTypes
} from "../config/MultiplayerConfig.js";

export default class MultiplayerClient extends MultiplayerPeer {

    #isConnected = false;

    #rtcClient;

    #eventTargetManager = new EventTargetManager();

    constructor(rtcClient, username, syncedStorages) {
        super(rtcClient, username, syncedStorages);
        this.#rtcClient = rtcClient;

        /* RTC */
        this.#eventTargetManager.switchTarget(this.#rtcClient);
        this.#eventTargetManager.set(["closed", "failed"], async () => {
            this.#isConnected = false;
            const ev = new Event("disconnected");
            this.dispatchEvent(ev);
        });
        this.#eventTargetManager.set(`ready:${DATA_CHANNEL_NAME}`, () => {
            this.sendSync();
        });
    }

    async disconnect() {
        await this.#rtcClient.disconnect();
        this.#isConnected = false;
        /* clean up */
        super.disconnect();
        this.#eventTargetManager.switchTarget(null);
    }

    isConnected() {
        return this.#isConnected;
    }

    async rtcMessageHandler(remoteID, msg) {
        if (msg.type == MessageTypes.JOIN) {
            Toast.info(`Multiplayer: "${msg.data}" joined`);
        } else if (msg.type == MessageTypes.LEAVE) {
            Toast.warn(`Multiplayer: "${msg.data}" left`);
        } else if (msg.type == MessageTypes.KICK) {
            ModalDialog.alert("You have been kicked", `You have been kicked by the host: ${msg.data ? msg.data : "no reason provided"}.`);
        } else if (msg.type == MessageTypes.ROOMUPDATE) {
            const ev = new Event("roomupdate");
            ev.data = msg.data;
            this.dispatchEvent(ev);
        } else if (msg.type == MessageTypes.SYNC) {
            this.setSyncSavestate(msg.data);
        } else {
            await super.rtcMessageHandler(remoteID, msg);
        }
    }

}
