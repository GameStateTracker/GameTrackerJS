import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import Savestate from "../../../savestate/Savestate.js";
import MultiplayerPeer from "./MultiplayerPeer.js";

const EVENT_TARGET_MANAGER = new WeakMap();

const RTC = new WeakMap();
const VERSION = new WeakMap();
const CLIENTS = new WeakMap();
const SPECTATORS = new WeakMap();
const REV_LOOKUP = new WeakMap();

export default class RTCPeerHost extends MultiplayerPeer {

    constructor(rtcClient, username, version) {
        super(rtcClient, username);
        RTC.set(this, rtcClient);
        VERSION.set(this, version);
        CLIENTS.set(this, new Map());
        SPECTATORS.set(this, new Map());
        REV_LOOKUP.set(this, new Map());

        /* RTC */
        const eventTargetManager = new EventTargetManager(rtcClient);
        EVENT_TARGET_MANAGER.set(this, eventTargetManager);

        eventTargetManager.set(["disconnect", "closed", "failed"], (event) => {
            const key = event.remoteID;
            const clients = CLIENTS.get(this);
            const spectators = SPECTATORS.get(this);
            const reverseLookup = REV_LOOKUP.get(this);
            let name = "";
            if (clients.has(key)) {
                name = clients.get(key);
                clients.delete(key);
            } else if (spectators.has(key)) {
                name = spectators.get(key);
                spectators.delete(key);
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
        Savestate.addEventListener("load", () => {
            rtcClient.send("data", {
                type: "state",
                data: this.getNetworkSafeState()
            });
        });
    }

    async close() {
        const rtcClient = RTC.get(this);
        const res = await rtcClient.unregister();
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
        const spectators = SPECTATORS.get(this);
        clients.clear();
        spectators.clear();
        /* EVENTS */
        const eventTargetManager = EVENT_TARGET_MANAGER.get(this);
        eventTargetManager.clear();
    }

    getUserList() {
        const clients = CLIENTS.get(this);
        const spectators = SPECTATORS.get(this);
        return {
            host: this.username,
            clients: Array.from(clients.values()),
            spectators: Array.from(spectators.values())
        };
    }

    async kick(name) {
        const rtcClient = RTC.get(this);
        const reverseLookup = REV_LOOKUP.get(this);
        if (reverseLookup.has(name)) {
            const reason = await ModalDialog.prompt("Please provide a reason", "Please provide a reason for kicking the client.");
            if (typeof reason == "string") {
                const key = reverseLookup.get(name);
                rtcClient.sendOne("data", key, {
                    type: "kick",
                    data: reason
                });
                await rtcClient.cut(key);
            }
        }
    }

    async rtcMessageHandler(remoteID, msg) {
        const rtcClient = RTC.get(this);
        if (msg.type == "name") {
            const reverseLookup = REV_LOOKUP.get(this);
            if (msg.data == this.username || reverseLookup.has(msg.data)) {
                rtcClient.sendOne("data", remoteID, {
                    type: "name",
                    data: {
                        success: false,
                        name: msg.data
                    }
                });
            } else {
                const clients = CLIENTS.get(this);
                rtcClient.sendOne("data", remoteID, {
                    type: "name",
                    data: {
                        success: true,
                        name: msg.data
                    }
                });
                rtcClient.sendOne("data", remoteID, {
                    type: "state",
                    data: this.getNetworkSafeState()
                });
                clients.set(remoteID, msg.data);
                // or spectators.set(key, msg.data);
                reverseLookup.set(msg.data, remoteID);
                Toast.info(`Multiplayer: "${msg.data}" joined`);
                rtcClient.sendButOne("data", remoteID, {
                    type: "join",
                    data: msg.data
                });
                const data = this.getUserList();
                rtcClient.send("data", {
                    type: "room",
                    data: data
                });
                rtcClient.sendOne("data", remoteID, {type: "synced"});
                /* roomupdate event */
                const ev = new Event("roomupdate");
                ev.data = data;
                this.dispatchEvent(ev);
            }
        } else if (msg.type == "event") {
            const clients = CLIENTS.get(this);
            if (clients.has(remoteID) && await super.rtcMessageHandler(remoteID, msg)) {
                rtcClient.sendButOne("data", remoteID, msg);
            }
        }
    }

}
