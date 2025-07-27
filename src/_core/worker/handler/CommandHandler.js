
import Import from "/emcJS/util/import/Import.js";
import MessagePortHandler from "/emcJS/worker/util/PortHandler.js";
import {
    isClass
} from "/emcJS/util/helper/Class.js";
import {
    isEqual
} from "/emcJS/util/helper/Comparator.js";
import Savestate from "../../../savestate/Savestate.js";

const REGISTERED_STORAGE_CONFIGURATIONS = new Map();

class CommandHandler {

    async handleCommand(conf, port) {
        const {command, data} = conf;
        try {
            switch (command) {
                case "registerStorage": {
                    await this.#registerStorage(data);
                } break;
            }
        } catch (error) {
            MessagePortHandler.sendOne({
                type: "error",
                message: error,
                data: {
                    type: "command",
                    command,
                    data
                }
            }, port);
        }
    }

    async #registerStorage(data) {
        const {name, path, eventName, params} = data;
        /* --- */
        if (Savestate.isStorageRegistered(name)) {
            const registeredConfig = REGISTERED_STORAGE_CONFIGURATIONS.get(name);
            if (registeredConfig.path !== path) {
                throw new Error(`failed to verify storage "${name}" - requested path does not match previous path`);
            }
            if (registeredConfig.eventName !== eventName) {
                throw new Error(`failed to verify storage "${name}" - requested eventName does not match previous eventName`);
            }
            if (!isEqual(registeredConfig.params, params)) {
                throw new Error(`failed to verify storage "${name}" - requested params do not match previous params`);
            }
            return;
        }
        REGISTERED_STORAGE_CONFIGURATIONS.set(name, {path, eventName, params});
        /* --- */
        const [Storage] = await Import.module(path);
        if (isClass(Storage)) {
            Savestate.registerStorage(name, new Storage(...params), eventName);
        } else {
            Savestate.registerStorage(name, Storage, eventName);
        }
    }

}

export default new CommandHandler();
