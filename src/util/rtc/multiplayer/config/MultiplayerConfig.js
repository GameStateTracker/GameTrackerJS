import {isStringNotEmpty} from "/emcJS/util/helper/CheckType.js";
import Enum from "/emcJS/data/Enum.js";

export const PING_CHANNEL_NAME = "ping";

export const DATA_CHANNEL_NAME = "data";

export const DEFAULT_STORAGES = [
    "items",
    "locations",
    "exitBindings",
    "areaHints",
    "locationItems",
    "startItems",
    "options"
];

export class MessageTypes extends Enum {

    static JOIN = new this("join");

    static LEAVE = new this("leave");

    static KICK = new this("kick");

    static NAME = new this("name");

    static ROOMUPDATE = new this("roomupdate");

    static SYNC = new this("sync");

    static UPDATE = new this("update");

}

export class ClientTypes extends Enum {

    #label;

    constructor(value, label) {
        if (!isStringNotEmpty(label)) {
            throw new TypeError("label must be a non empty string");
        }
        super(value);
        this.#label = label;
    }

    get label() {
        return this.#label;
    }

    static PLAYER = new this("player", "Player");

    static SPECTATOR = new this("spectator", "Spectator");

    static defaultType = this.PLAYER;

}
