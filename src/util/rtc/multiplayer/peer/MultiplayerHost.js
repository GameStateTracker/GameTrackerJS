import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import Toast from "/emcJS/ui/overlay/message/Toast.js";
import Savestate from "../../../../savestate/Savestate.js";
import MultiplayerPeer from "./MultiplayerPeer.js";
import {
    ClientTypes,
    DATA_CHANNEL_NAME, MessageTypes
} from "../config/MultiplayerConfig.js";

// TODO add EventManager activated when player is hosting
// should contain all savestate related events
export default class MultiplayerHost extends MultiplayerPeer {

    #isHosting = false;

    #isRoomVisible = true;

    #rtcClient;

    #clients = new Map();

    #reverseLookup = new Map();

    #joiningClientType = ClientTypes.defaultType;

    #eventTargetManager = new EventTargetManager();

    #savestateEventManager = new EventTargetManager(Savestate);

    constructor(rtcClient, roomName, username, visible, syncedStorages) {
        super(rtcClient, roomName, username, syncedStorages);
        this.#rtcClient = rtcClient;
        this.#isRoomVisible = !!(visible ?? true);

        /* RTC */
        this.#eventTargetManager.switchTarget(this.#rtcClient);
        this.#eventTargetManager.set(["closed"], async (event) => {
            const {remoteId} = event;
            if (this.#clients.has(remoteId)) {
                const clientData = this.#clients.get(remoteId);
                const name = clientData.name;
                this.#clients.delete(remoteId);
                this.#reverseLookup.delete(name);
                Toast.warn(`Multiplayer: "${name}" left`);
                rtcClient.send(DATA_CHANNEL_NAME, {
                    type: MessageTypes.LEAVE,
                    data: name
                });
                this.refreshUserList();
            }
        });

        /* SAVESTATE */
        this.#savestateEventManager.set("load", () => {
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

    async disconnect() {
        await this.#rtcClient.unregister();
        await this.#rtcClient.disconnect();
        this.#isHosting = false;
        /* clean up */
        super.disconnect();
        this.#eventTargetManager.disconnect();
        this.#savestateEventManager.disconnect();
        this.#clients.clear();
        this.#reverseLookup.clear();
    }

    isHosting() {
        return this.#isHosting;
    }

    async setRoomVisibility(value) {
        if (this.#isRoomVisible != value) {
            const res = await this.#rtcClient.setRoomVisibility(value);
            if (!res.success) {
                ModalDialog.alert("Error changing room visibility", "The Room visibility could not be changed.");
                return false;
            }
            this.#isRoomVisible = value;
            Toast.success("Multiplayer: Room visibility changed");
        }
        return true;
    }

    isRoomVisible() {
        return this.#isRoomVisible;
    }

    sendSync(remoteId) {
        if (this.#rtcClient != null) {
            if (remoteId != null) {
                const data = this.getSyncSavestate();
                this.#rtcClient.sendOne(DATA_CHANNEL_NAME, remoteId, {
                    type: MessageTypes.SYNC,
                    data
                });
            } else {
                const data = this.getSyncSavestate();
                this.#rtcClient.send(DATA_CHANNEL_NAME, {
                    type: MessageTypes.SYNC,
                    data
                });
            }
        }
    }

    async rtcMessageHandler(remoteId, msg) {
        if (msg.type == MessageTypes.SYNC) {
            this.sendSync(remoteId);
        } else if (msg.type == MessageTypes.NAME) {
            const username = msg.data;
            if (username == this.username || this.#reverseLookup.has(username)) {
                this.#rtcClient.sendOne(DATA_CHANNEL_NAME, remoteId, {
                    type: MessageTypes.NAME,
                    data: {
                        success: false,
                        name: username
                    }
                });
            } else {
                this.#rtcClient.renameInstance(remoteId, username);
                this.#rtcClient.sendOne(DATA_CHANNEL_NAME, remoteId, {
                    type: MessageTypes.NAME,
                    data: {
                        success: true,
                        name: username
                    }
                });
                this.sendSync(remoteId);
                this.#clients.set(remoteId, {
                    type: this.#joiningClientType,
                    name: username
                });
                this.#reverseLookup.set(username, remoteId);
                Toast.info(`Multiplayer: "${username}" joined`);
                this.#rtcClient.sendButOne(DATA_CHANNEL_NAME, remoteId, {
                    type: MessageTypes.JOIN,
                    data: username
                });
                this.refreshUserList();
            }
        } else if (this.#clients.has(remoteId)) {
            const clientData = this.#clients.get(remoteId);
            if (clientData.type === ClientTypes.PLAYER) {
                if (await super.rtcMessageHandler(remoteId, msg)) {
                    this.#rtcClient.sendButOne(DATA_CHANNEL_NAME, remoteId, msg);
                }
            } else if (clientData.type === ClientTypes.SPECTATOR) {
                this.sendSync(remoteId);
            }
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
        for (const clientData of this.#clients.values()) {
            if (clientData.type === ClientTypes.PLAYER) {
                players.push(clientData.name);
            } else if (clientData.type === ClientTypes.SPECTATOR) {
                spectators.push(clientData.name);
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

    updateRole(name, role) {
        const clientType = ClientTypes.get(role);
        if (clientType != null) {
            const remoteId = this.#reverseLookup.get(name);
            if (remoteId != null) {
                const clientData = this.#clients.get(remoteId);
                if (clientData != null) {
                    clientData.type = ClientTypes.get(role);
                    this.refreshUserList();
                }
            }
        }
    }

}
