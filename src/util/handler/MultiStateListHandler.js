import StateListHandler from "./StateListHandler.js";
import EventMultiTargetManager from "/emcJS/util/event/EventMultiTargetManager.js";

export default class MultiStateListHandler extends EventTarget {

    #listHandler = new Set();

    #listHandlerEventManager = new EventMultiTargetManager();

    constructor() {
        super();
        this.#listHandlerEventManager.set("visibility", () => {
            const ev = new Event("visibility");
            this.dispatchEvent(ev);
        });
        this.#listHandlerEventManager.set("access", () => {
            const event = new Event("access");
            this.dispatchEvent(event);
        });
    }

    register(handler) {
        if (!(handler instanceof StateListHandler)) {
            throw new Error("can only register instances of StateListHandler");
        }
        if (!this.#listHandler.has(handler)) {
            this.#listHandler.has(handler);
            this.#listHandlerEventManager.addTarget(handler);
        }
    }

    unregister(handler) {
        if (this.#listHandler.has(handler)) {
            this.#listHandler.delete(handler);
            this.#listHandlerEventManager.removeTarget(handler);
        }
    }

}
