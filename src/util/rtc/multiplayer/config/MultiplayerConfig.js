import Enum from "/emcJS/data/Enum.js";

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

    static PLAYER = new this("player");

    static SPECTATOR = new this("spectator");

}
