import Enum from "/emcJS/data/Enum.js";

export const DATA_CHANNEL_NAME = "data";

export const DEFAULT_STORAGES = [
    "items",
    "options"
];

export class MessageTypes extends Enum {

    static SYNC = new this("sync");

    static UPDATE = new this("update");

    static SETTINGS = new this("settings");

    static ACCESS = new this("access");

}
