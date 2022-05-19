import {
    createMixin
} from "/emcJS/util/Mixin.js";
import LogicHandler from "../../util/handler/LogicHandler.js";

export default createMixin((superclass) => class StateAccessPenetrationMixin extends superclass {

    #handler = null;

    constructor(ref, props = {}) {
        super(ref, props);

        this.#handler = new LogicHandler(props.accessPenetration);
        this.#handler.addEventListener("change", (event) => {
            const ev = new Event("accessPenetration");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
    }

    setLogicData(key, value) {
        if (super.setLogicData) {
            super.setLogicData(key, value);
        }
        this.#handler.setDataValue(key, value);
    }

    removeLogicData(key) {
        if (super.removeLogicData) {
            super.removeLogicData(key);
        }
        this.#handler.removeDataValue(key);
    }

    clearLogicData() {
        if (super.clearLogicData) {
            super.clearLogicData();
        }
        this.#handler.clearData();
    }

    get accessPenetration() {
        return this.#handler?.value ?? false;
    }

});
