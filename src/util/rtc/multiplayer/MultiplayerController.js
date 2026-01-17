import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import LobbyClient from "/rtc/LobbyClient.js";
import MultiplayerClient from "./peer/MultiplayerClient.js";
import MultiplayerHost from "./peer/MultiplayerHost.js";
import {RTC_CONFIG} from "../config/RTCConfig.js";
import {
    DATA_CHANNEL_NAME, MessageTypes
} from "./config/MultiplayerConfig.js";

async function promtName(name) {
    name = await ModalDialog.prompt("Please select a username", "Please enter a name (at least 3 characters).", name);
    if (typeof name != "string") {
        return false;
    }
    if (name.length < 3) {
        await ModalDialog.alert("Invalid username", "Username can not be less then 3 characters.");
        return await promtName();
    }
    return name;
}

export default class MultiplayerController extends EventTarget {

    #syncedStorages = [];

    #rtcClient;

    #rtcPeer;

    #rtcClientEventManager;

    #rtcPeerEventManager = new EventTargetManager();

    constructor(port, syncedStorages) {
        super();
        this.#syncedStorages = syncedStorages;
        this.#rtcClient = new LobbyClient(port, "/lobby", RTC_CONFIG, [DATA_CHANNEL_NAME]);
        this.#rtcClientEventManager = new EventTargetManager(this.#rtcClient);
        this.#rtcPeerEventManager.set("roomupdate", (event) => {
            const ev = new Event("roomupdate");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
        this.#rtcPeerEventManager.set("disconnected", () => {
            const ev = new Event("disconnected");
            this.dispatchEvent(ev);
        });
    }

    setLogger(value) {
        LobbyClient.setLogger(value);
    }

    async getInstances(supressError) {
        const res = await this.#rtcClient.getInstances();
        if (res == null || !res.success) {
            if (!supressError) {
                await ModalDialog.alert("Connection error", "There seems to be an connection issue trying to refresh the instance list.\nPlease try again later.");
            }
            if (res.error != null) {
                console.error(res.error);
            }
            return [];
        }
        return res.data;
    }

    getPeer() {
        return this.#rtcPeer;
    }

    async host(roomName, pass, version, data) {
        if (roomName) {
            const res = await this.#rtcClient.register(roomName, pass, version, data);
            if (res.success === true) {
                const username = await promtName(roomName);
                if (!username) {
                    await ModalDialog.alert("Aborted Lobby creation", "Lobby will be closed now.");
                    await this.#rtcClient.unregister();
                    return false;
                } else {
                    this.#rtcPeer = new MultiplayerHost(this.#rtcClient, roomName, username, data.visible, this.#syncedStorages);
                    this.#rtcPeerEventManager.switchTarget(this.#rtcPeer);
                    /* roomupdate */
                    const ev = new Event("roomupdate");
                    ev.data = this.#rtcPeer.getUserList();
                    this.dispatchEvent(ev);
                    return true;
                }
            } else {
                await ModalDialog.alert("Error registering to Lobby", "An error occured while registering your room to the lobby.\nCheck if the room already exists and try again!");
                return false;
            }
        } else {
            await ModalDialog.alert("Error registering to Lobby", "Can not register a room without a name.");
            return false;
        }
    }

    join(roomName, pass, version) {
        return new Promise((resolve) => {
            this.#rtcClientEventManager.set(["closed", "failed"], async () => {
                await ModalDialog.alert("Connection failed", "Something went wrong connecting to the host.\nPlease try again later!");
                this.#rtcClientEventManager.clear();
                resolve(false);
            });
            this.#rtcClient.connect(roomName, pass, version).then(async (res) => {
                if (res.success === true) {
                    this.#rtcClient.setMessageHandler(DATA_CHANNEL_NAME, async (key, msg) => {
                        if (msg.type == MessageTypes.NAME) {
                            if (msg.data.success) {
                                this.#rtcClientEventManager.clear();
                                this.#rtcPeer = new MultiplayerClient(this.#rtcClient, roomName, msg.data.name, this.#syncedStorages);
                                this.#rtcPeerEventManager.switchTarget(this.#rtcPeer);
                                resolve(true);
                            } else {
                                await ModalDialog.alert("Username taken", `The username "${msg.data.name}" is already taken.\nPlease choose another one!`);
                                if (!await this.#promptPeerName(msg.data.name)) {
                                    this.#rtcClientEventManager.clear();
                                    resolve(false);
                                }
                            }
                        }
                    });
                    this.#rtcClientEventManager.set("connected", async () => {
                        if (!await this.#promptPeerName("")) {
                            this.#rtcClientEventManager.clear();
                            resolve(false);
                        }
                    });
                } else {
                    await ModalDialog.alert("Connection refused", res.error);
                    this.#rtcClientEventManager.clear();
                    resolve(false);
                }
            });
        });
    }

    async #promptPeerName(name) {
        name = await promtName(name);
        if (!name) {
            return false;
        }
        this.#rtcClient.send(DATA_CHANNEL_NAME, {
            type: MessageTypes.NAME,
            data: name
        });
        return true;
    }

}
