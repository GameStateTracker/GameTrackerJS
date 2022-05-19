// frameworks
import {
    debounce
} from "/emcJS/util/Debouncer.js";
import LogicCompiler from "/emcJS/util/logic/Compiler.js";
import EventTargetManager from "/emcJS/util/event/EventTargetManager.js";

import LogicDataCollector from "../logic/LogicDataCollector.js";
import FilterStorage from "../../savestate/storage/FilterStorage.js";

const EVENTS = ["load", "change"];

function mapToObj(map) {
    const res = {};
    map.forEach((v, k) => {
        res[k] = v;
    });
    return res;
}

export default class FilterHandler extends EventTarget {

    #logics = new Map();

    #values = new Map();

    #data = new Map();

    constructor(config = {}) {
        super();
        for (const filter in config) {
            const filterValue = FilterStorage.get(filter);
            for (const value in config[filter]) {
                const logic = config[filter][value];
                this.#compileLogic(filter, value, filterValue, logic);
            }
        }
        FilterStorage.addEventListener("change", () => {
            this.#update();
        });
        const storageEventManager = new EventTargetManager(LogicDataCollector);
        storageEventManager.set(EVENTS, () => {
            this.#update();
        });
    }

    #compileLogic(filter, value, filterValue, logic) {
        const logicKey = `${filter}[${value}]`;
        this.#values.set(filter, true);
        if (typeof logic == "object") {
            const logicFn = LogicCompiler.compile(logic);
            this.#logics.set(logicKey, logicFn);
            if (value == filterValue) {
                const logicValue = this.#execute(logicFn);
                this.#values.set(filter, logicValue);
            }
        } else if (logic != null) {
            this.#logics.set(logicKey, logic);
            if (value == filterValue) {
                const logicValue = !!logic;
                this.#values.set(filter, logicValue);
            }
        }
    }

    #getValue(key) {
        return this.#data.get(key) ?? LogicDataCollector.get(key);
    }

    #execute(logicFn) {
        if (typeof logicFn == "function") {
            return !!logicFn((key) => {
                return this.#getValue(key);
            });
        } else if (logicFn != null) {
            return !!logicFn;
        } else {
            return true;
        }
    }

    #update = debounce(() => {
        if (this.#values != null) {
            const changes = {};
            for (const [filter, oldValue] of this.#values) {
                const value = FilterStorage.get(filter);
                const logicKey = `${filter}[${value}]`;
                const logicFn = this.#logics.get(logicKey);
                const logicValue = this.#execute(logicFn);
                if (oldValue != logicValue) {
                    this.#values.set(filter, logicValue);
                    changes[filter] = logicValue;
                }
            }
            if (Object.keys(changes).length) {
                const event = new Event("change");
                event.value = changes;
                this.dispatchEvent(event);
            }
        }
    });

    setDataValue(key, value) {
        const old = this.#data.get(key);
        if (old != value) {
            this.#data.set(key, value);
            this.#update();
        }
    }

    removeDataValue(key) {
        if (this.#data.has(key)) {
            this.#data.delete(key);
            this.#update();
        }
    }

    clearData() {
        this.#data.clear();
        this.#update();
    }

    get filter() {
        return mapToObj(this.#values);
    }

    get value() {
        const activeFilter = FilterStorage.getAll();
        for (const filter in activeFilter) {
            if (this.#values.has(filter) && !this.#values.get(filter)) {
                return true;
            }
        }
        return false;
    }

}
