import ModalDialog from "/emcJS/ui/modal/ModalDialog.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";
import RTCClient from "/rtc/RTCClient.js";
import RTCPeerHost from "./RTCPeerHost.js";
import RTCPeerClient from "./RTCPeerClient.js";

// TODO create listentry editor for using custom stun/turn server config

const CONFIG = {
    iceTransportPolicy: "all", // all | relay
    iceServers: [{urls: "stun:stun.zidargs.net:18001"}, {urls: "stun:stun.l.google.com:19302"}, {
        urls: "turn:turn.zidargs.net:18001",
        credential: "fHNsIeqdgVcUAypvaxDVE6tywaMlP1fA",
        username: "iamgroot"
    }]
};

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

export default class RTCController extends EventTarget {

    #rtcClient;

    #rtcPeer;

    #rtcClientEventManager;

    #rtcPeerEventManager = new EventTargetManager();

    constructor(port) {
        super();
        this.#rtcClient = new RTCClient(port, CONFIG, ["data"]);
        this.#rtcClientEventManager = new EventTargetManager(this.#rtcClient);
        this.#rtcPeerEventManager.set("roomupdate", (event) => {
            const ev = new Event("roomupdate");
            ev.data = event.data;
            this.dispatchEvent(ev);
        });
    }

    setLogger(value) {
        RTCClient.setLogger(value);
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

    async host(name, pass, desc, version, data) {
        if (name) {
            const res = await this.#rtcClient.register(name, pass, desc, version, data);
            if (res.success === true) {
                const username = await promtName(name);
                if (!username) {
                    await ModalDialog.alert("Aborted Lobby creation", "Lobby will be closed now.");
                    await this.close();
                } else {
                    this.#rtcPeer = new RTCPeerHost(this.#rtcClient, username, version);
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

    join(name, pass, version) {
        return new Promise((resolve) => {
            this.#rtcClientEventManager.set(["closed", "failed"], async () => {
                await ModalDialog.alert("Connection failed", "Something went wrong connecting to the host.\nPlease try again later!");
                this.#rtcClientEventManager.clear();
                resolve(false);
            });
            this.#rtcClient.connect(name, pass, version).then(async (res) => {
                if (res.success === true) {
                    this.#rtcClient.setMessageHandler("data", async (key, msg) => {
                        if (msg.type == "name") {
                            if (msg.data.success) {
                                this.#rtcClientEventManager.clear();
                                this.#rtcPeer = new RTCPeerClient(this.#rtcClient, msg.data.name);
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
        this.#rtcClient.send("data", {
            type: "name",
            data: name
        });
        return true;
    }

}
