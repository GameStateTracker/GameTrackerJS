import {
    deepClone
} from "/emcJS/util/helper/DeepClone.js";

class WorldEditorScope extends EventTarget {

    #entityType = "";

    #entityName = "";

    #filterConfig = {};

    reset() {
        this.#entityType = "";
        this.#entityName = "";
    }

    set entityType(value) {
        this.#entityType = value;
    }

    get entityType() {
        return this.#entityType;
    }

    set entityName(value) {
        this.#entityName = value;
    }

    get entityName() {
        return this.#entityName;
    }

    set filterConfig(config) {
        this.#filterConfig = deepClone(config);
    }

    get filterConfig() {
        return this.#filterConfig;
    }

}

const scope = new WorldEditorScope();

window.worldEditorScope = scope;

export default scope;
