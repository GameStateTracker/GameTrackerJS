import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";
import Savestate from "../../../../savestate/Savestate.js";
import MultiplayerPeer from "./MultiplayerPeer.js";
import {
    ClientTypes,
    DATA_CHANNEL_NAME, MessageTypes
} from "../config/MultiplayerConfig.js";

export default class MultiplayerHost extends MultiplayerPeer {

    #isHosting = false;

    #isRoomVisible = false;

    #rtcClient;

    #clients = new Map();

    #reverseLookup = new Map();

    #joiningClientType = ClientTypes.defaultType;

    #eventTargetManager = new EventTargetManager();

    constructor(rtcClient, username, syncedStorages) {
        super(rtcClient, username, syncedStorages);
        this.#rtcClient = rtcClient;

        /* RTC */
        this.#eventTargetManager.switchTarget(this.#rtcClient);
        this.#eventTargetManager.set(["closed"], async (event) => {
            const {remoteID} = event;
            let name = "";
            if (this.#clients.has(remoteID)) {
                name = this.#clients.get(remoteID);
                this.#clients.delete(remoteID);
                this.#reverseLookup.delete(name);
            } else {
                return;
            }
            Toast.warn(`Multiplayer: "${name}" left`);
            rtcClient.send(DATA_CHANNEL_NAME, {
                type: MessageTypes.LEAVE,
                data: name
            });
            this.refreshUserList();
        });

        /* SAVESTATE */
        Savestate.addEventListener("load", () => {
            this.sendSync();
        });
    }

    set joiningClientType(value) {
        if (!(value instanceof ClientTypes)) {
            value = ClientTypes.get(value);
        }
        if (value != null) {
            this.#joiningClientType = value;
        }
    }

    get joiningClientType() {
        return this.#joiningClientType;
    }

    async close() {
        await this.#rtcClient.unregister();
        await this.#rtcClient.disconnect();
        this.#isHosting = false;
        /* clean up */
        super.disconnect();
        this.#eventTargetManager.switchTarget(null);
        this.#clients.clear();
        this.#reverseLookup.clear();
    }

    isHosting() {
        return this.#isHosting;
    }

    async setRoomVisible(/* value */) {
        // if (this.#isRoomVisible != value) {
        //     const res = await this.#rtcClient.setVisible(value);
        //     if (!res.success) {
        //         ModalDialog.alert("Error changing room visibility", "The Room visibility could not be changed.");
        //         return false;
        //     }
        //     this.#isRoomVisible = value;
        //     Toast.success("Multiplayer: Room visibility changed");
        // }
        return true;
    }

    isRoomVisible() {
        return this.#isRoomVisible;
    }

    sendSync() {
        if (this.#rtcClient != null) {
            const data = this.getSyncSavestate();
            this.#rtcClient.send(DATA_CHANNEL_NAME, {
                type: MessageTypes.SYNC,
                data
            });
        }
    }

    async rtcMessageHandler(remoteID, msg) {
        if (msg.type == MessageTypes.SYNC) {
            this.sendSync();
        } else if (msg.type == MessageTypes.NAME) {
            const username = msg.data;
            if (username == this.username || this.#reverseLookup.has(username)) {
                this.#rtcClient.sendOne(DATA_CHANNEL_NAME, remoteID, {
                    type: MessageTypes.NAME,
                    data: {
                        success: false,
                        name: username
                    }
                });
            } else {
                this.#rtcClient.sendOne(DATA_CHANNEL_NAME, remoteID, {
                    type: MessageTypes.NAME,
                    data: {
                        success: true,
                        name: username
                    }
                });
                this.sendSync();
                this.#clients.set(remoteID, {
                    type: this.#joiningClientType,
                    name: username
                });
                this.#reverseLookup.set(username, remoteID);
                Toast.info(`Multiplayer: "${username}" joined`);
                this.#rtcClient.sendButOne(DATA_CHANNEL_NAME, remoteID, {
                    type: MessageTypes.JOIN,
                    data: username
                });
                this.refreshUserList();
            }
        } else if (this.#clients.has(remoteID) && await super.rtcMessageHandler(remoteID, msg)) {
            this.#rtcClient.sendButOne(DATA_CHANNEL_NAME, remoteID, msg);
        }
    }

    refreshUserList() {
        const userList = this.getUserList();
        this.#rtcClient.send(DATA_CHANNEL_NAME, {
            type: MessageTypes.ROOMUPDATE,
            data: userList
        });
        /* roomupdate event */
        const ev = new Event("roomupdate");
        ev.data = userList;
        this.dispatchEvent(ev);
    }

    getUserList() {
        const players = [];
        const spectators = [];
        for (const client of this.#clients.values()) {
            if (client.type === ClientTypes.PLAYER) {
                players.push(client.name);
            } else if (client.type === ClientTypes.SPECTATOR) {
                spectators.push(client.name);
            }
        }
        return {
            host: this.username,
            players,
            spectators
        };
    }

    async kick(name) {
        if (this.#reverseLookup.has(name)) {
            const reason = await ModalDialog.prompt("Please provide a reason", "Please provide a reason for kicking the client.");
            if (typeof reason == "string") {
                const key = this.#reverseLookup.get(name);
                this.#rtcClient.sendOne(DATA_CHANNEL_NAME, key, {
                    type: MessageTypes.KICK,
                    data: reason
                });
                await this.#rtcClient.cutConnection(key);
            }
        }
    }

}
