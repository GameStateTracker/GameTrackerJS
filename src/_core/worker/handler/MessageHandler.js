
import MessagePortHandler from "/emcJS/worker/util/PortHandler.js";
import CommandHandler from "./CommandHandler.js";

class MessageHandler {

    constructor() {
        MessagePortHandler.addEventListener("message", (event) => {
            const {data, port} = event;
            if (data === "ready") {
                // send initial information
            } else {
                const {type, ...conf} = data;
                switch (type) {
                    case "command": {
                        CommandHandler.handleCommand(conf, port);
                    } break;
                    case "dataChange": {
                    // todo handle storage {storage: string, event: string, data: {[key]: value}}
                    } break;
                }
            }
        });
    }

}

export default new MessageHandler();
