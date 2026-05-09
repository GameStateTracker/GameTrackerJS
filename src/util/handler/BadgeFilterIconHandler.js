import EventTargetManager from "@emcjs/core/util/event/EventTargetManager.js";
import LogicCompiler from "@emcjs/core/util/logic/processor/LogicCompiler.js";
import {debounce} from "@emcjs/core/util/Debouncer.js";
import {deepClone} from "@emcjs/core/util/helper/DeepClone.js";
import TrackerLogicDataCollector from "../logic/TrackerLogicDataCollector.js";

const EVENTS = ["load", "change"];

export default class BadgeFilterIconHandler extends EventTarget {

    #ref = "";

    #icon = "";

    #badgeConfig = {};

    #logics = new Map();

    #values = new Map();

    constructor(ref, badgeConfig = {}, filterLogic = {}) {
        super();
        this.#ref = ref;
        this.#badgeConfig = deepClone(badgeConfig);
        if (badgeConfig.badge) {
            for (const valueRef in filterLogic) {
                const logic = filterLogic[valueRef];
                this.#compileLogic(valueRef, logic);
            }
            const storageEventManager = new EventTargetManager(TrackerLogicDataCollector);
            storageEventManager.set(EVENTS, () => {
                this.#update();
            });
            /* --- */
            this.#icon = this.#getFilterImage();
        }
    }

    get ref() {
        return this.#ref;
    }

    #compileLogic(valueRef, logic) {
        if (typeof logic == "object") {
            const logicFn = LogicCompiler.compile(logic);
            this.#logics.set(valueRef, logicFn);
            const logicValue = this.#execute(logicFn);
            this.#values.set(valueRef, logicValue);
        } else if (logic != null) {
            this.#logics.set(valueRef, logic);
            const logicValue = !!logic;
            this.#values.set(valueRef, logicValue);
        } else {
            this.#values.set(valueRef, true);
        }
    }

    #getValue(key) {
        return TrackerLogicDataCollector.get(key);
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
            let changed = false;
            for (const [valueRef, oldValue] of this.#values) {
                const logicFn = this.#logics.get(valueRef);
                const logicValue = this.#execute(logicFn);
                if (oldValue != logicValue) {
                    this.#values.set(valueRef, logicValue);
                    changed = true;
                }
            }
            if (changed) {
                this.#icon = this.#getFilterImage();
                const event = new Event("change");
                event.data = {
                    ref: this.#ref,
                    icon: this.#icon
                };
                this.dispatchEvent(event);
            }
        }
    });

    get icon() {
        return this.#icon;
    }

    #getFilterImage() {
        if (this.#badgeConfig.badge) {
            if (Array.isArray(this.#badgeConfig.badge)) {
                for (const entry of this.#badgeConfig.badge) {
                    if (entry.values == null || Object.entries(entry.values).every(([key, value]) => this.#values.get(key) === value)) {
                        return entry.image ?? this.#badgeConfig.values[entry.index] ?? "";
                    }
                }
            }
            return this.#badgeConfig.values[this.#badgeConfig.default].image ?? "";
        }
        return "";
    }

}
