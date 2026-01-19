import Enum from "/emcJS/data/Enum.js";

// TODO define this in tracker not here
export const ENDPOINT_BASE = "/rtc/";

// TODO define this in tracker not here
export const ENDPOINT_NAME = "itemview";

export const DATA_CHANNEL_NAME = "data";

export const DEFAULT_STORAGES = [
    "items",
    "options"
];

export class MessageTypes extends Enum {

    static SYNC = new this("sync");

    static UPDATE = new this("update");

    static SETTINGS = new this("settings");

}
