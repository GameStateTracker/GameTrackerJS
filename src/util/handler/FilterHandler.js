import {debounce} from "@emcjs/core/util/Debouncer.js";
import EventTargetManager from "@emcjs/core/util/event/EventTargetManager.js";
import StatementCompiler from "@emcjs/logic/compiler/StatementCompiler.js";
import LogicStatement from "@emcjs/logic/compiler/statement/LogicStatement.js";
import TrackerLogicDataCollector from "../logic/TrackerLogicDataCollector.js";
import FilterStorage from "../../savestate/storage/FilterStorage.js";

const EVENTS = ["load", "change"];

export default class FilterHandler extends EventTarget {

    #logics = new Map();

    #values = new Map();

    #data = new Map();

    constructor(config = {}) {
        super();
        for (const filter in config) {
            this.#values.set(filter, true);
            const filterValue = FilterStorage.get(filter);
            for (const value in config[filter]) {
                const logic = config[filter][value];
                this.#compileLogic(filter, value, filterValue, logic);
            }
        }
        FilterStorage.addEventListener("change", () => {
            this.#update();
        });
        const storageEventManager = new EventTargetManager(TrackerLogicDataCollector);
        storageEventManager.set(EVENTS, () => {
            this.#update();
        });
    }

    #compileLogic(filter, value, filterValue, logic) {
        if (logic == null) {
            return;
        }
        const logicKey = `${filter}[${value}]`;
        if (logic instanceof LogicStatement) {
            this.#logics.set(logicKey, logic);
            if (value === filterValue) {
                this.#values.set(filter, this.#execute(logic));
            }
        } else if (typeof logic === "object") {
            const logicFn = StatementCompiler.compile(logic);
            this.#logics.set(logicKey, logicFn);
            if (value === filterValue) {
                this.#values.set(filter, this.#execute(logicFn));
            }
        } else if (typeof logic === "function") {
            this.#logics.set(logicKey, logic);
            if (value === filterValue) {
                this.#values.set(filter, !!logic());
            }
        } else {
            this.#logics.set(logicKey, logic);
            if (value === filterValue) {
                this.#values.set(filter, !!logic);
            }
        }
    }

    #getValue(key) {
        return this.#data.get(key) ?? TrackerLogicDataCollector.get(key);
    }

    #execute(logicFn) {
        if (logicFn instanceof LogicStatement) {
            return !!logicFn.execute((key) => {
                return this.#getValue(key);
            });
        } else if (typeof logicFn === "function") {
            return !!logicFn();
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
        return Object.fromEntries(this.#values);
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
