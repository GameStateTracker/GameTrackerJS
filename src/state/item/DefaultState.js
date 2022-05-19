// frameworks
import DataStorageValueObserver from "/emcJS/datastorage/DataStorageValueObserver.js";
import {
    mix
} from "/emcJS/util/Mixin.js";

import {
    parseSafeRange
} from "../../util/helper/ItemHelper.js";
import Savestate from "../../savestate/Savestate.js";
import OptionsObserver from "../../util/observer/OptionsObserver.js";
import DataState from "../DataState.js";
import StateVisibilityMixin from "../mixins/StateVisibilityMixin.js";

const STORAGES = {
    items: Savestate.getStorage("items"),
    startItems: Savestate.getStorage("startItems")
};

const DEF_MAX = new WeakMap();
const DEF_MIN = new WeakMap();
const MAX = new WeakMap();
const MIN = new WeakMap();
const START = new WeakMap();
const VALUE = new WeakMap();

const BaseClass = mix(
    DataState
).with(
    StateVisibilityMixin
);

export default class DefaultItemState extends BaseClass {

    constructor(ref, props = {}) {
        super(ref, props);

        /* DEFAULT */
        DEF_MAX.set(this, parseSafeRange(props.max, 0));
        DEF_MIN.set(this, parseSafeRange(props.min, 0));

        /* VAR MAX */
        if (props.varMax != null) {
            if (typeof props.varMax == "object") {
                if (props.varMax.option != null && props.varMax.values != null) {
                    const defMax = DEF_MAX.get(this);
                    const optionObserver = new OptionsObserver(props.varMax.option);
                    const maxVal = parseSafeRange(props.varMax.values[optionObserver.value], defMax);
                    if (maxVal != null) {
                        MAX.set(this, maxVal);
                    }
                    optionObserver.addEventListener("change", (event) => {
                        this.#setMax(props.varMax.values[event.data]);
                    });
                }
            } else if (typeof props.varMax == "string") {
                const defMax = DEF_MAX.get(this);
                const optionObserver = new OptionsObserver(props.varMax);
                const maxVal = parseSafeRange(optionObserver.value, defMax);
                if (maxVal != null) {
                    MAX.set(this, maxVal);
                }
                optionObserver.addEventListener("change", (event) => {
                    this.#setMax(event.data);
                });
            }
        }

        /* VAR MIN */
        if (props.varMin != null) {
            if (typeof props.varMin == "object") {
                if (props.varMin.option != null && props.varMin.values != null) {
                    const defMin = DEF_MIN.get(this);
                    const optionObserver = new OptionsObserver(props.varMin.option);
                    const minVal = parseSafeRange(props.varMin.values[optionObserver.value], defMin);
                    if (minVal != null) {
                        MIN.set(this, minVal);
                    }
                    optionObserver.addEventListener("change", (event) => {
                        this.#setMin(props.varMin.values[event.data]);
                    });
                }
            } else if (typeof props.varMin == "string") {
                const defMin = DEF_MIN.get(this);
                const optionObserver = new OptionsObserver(props.varMin);
                const minVal = parseSafeRange(optionObserver.value, defMin);
                if (minVal != null) {
                    MIN.set(this, minVal);
                }
                optionObserver.addEventListener("change", (event) => {
                    this.#setMin(event.data);
                });
            }
        }

        /* VALUES */
        const startItemsObserver = new DataStorageValueObserver(STORAGES.startItems, ref, 0);
        START.set(this, parseSafeRange(startItemsObserver.value, 0));
        startItemsObserver.addEventListener("change", (event) => {
            this.#setStart(event.value);
        });

        const itemsObserver = new DataStorageValueObserver(STORAGES.items, ref, 0);
        VALUE.set(this, this.#restrictValue(itemsObserver.value));
        itemsObserver.addEventListener("change", (event) => {
            this.value = event.value;
        });
    }

    #restrictValue(value) {
        const max = this.max;
        const min = this.min;
        if (value > max) {
            return max;
        }
        if (value < min) {
            return min;
        }
        return value;
    }

    #setMax(value) {
        const newMax = parseSafeRange(value, this.defaultMax);
        const oldMax = MAX.get(this);
        if (newMax != oldMax) {
            const oldValue = this.value;
            MAX.set(this, newMax);
            // external max
            const event = new Event("max");
            event.value = newMax;
            this.dispatchEvent(event);
            // external value
            const newValue = this.value;
            if (oldValue != newValue) {
                const event = new Event("value");
                event.value = newValue;
                this.dispatchEvent(event);
            }
        }
    }

    #setMin(value) {
        const newMin = parseSafeRange(value, 0);
        const oldMin = MIN.get(this);
        if (newMin != oldMin) {
            const oldValue = this.value;
            MIN.set(this, newMin);
            // external min
            const event = new Event("min");
            event.value = newMin;
            this.dispatchEvent(event);
            // external value
            const newValue = this.value;
            if (oldValue != newValue) {
                const event = new Event("value");
                event.value = newValue;
                this.dispatchEvent(event);
            }
        }
    }

    #setStart(value) {
        const newStart = parseSafeRange(value, 0);
        const oldStart = MIN.get(this);
        if (newStart != oldStart) {
            const oldValue = this.value;
            START.set(this, newStart);
            // external min
            const event = new Event("start");
            event.value = newStart;
            this.dispatchEvent(event);
            // external value
            const newValue = this.value;
            if (oldValue != newValue) {
                const event = new Event("value");
                event.value = newValue;
                this.dispatchEvent(event);
            }
        }
    }

    get defaultMax() {
        return DEF_MAX.get(this);
    }

    get defaultMin() {
        return DEF_MIN.get(this);
    }

    get max() {
        return MAX.get(this) ?? DEF_MAX.get(this);
    }

    get min() {
        return Math.max(MIN.get(this) ?? DEF_MIN.get(this), START.get(this) ?? 0);
    }

    set value(value) {
        const ref = this.ref;
        const rValue = parseSafeRange(value);
        if (rValue != null) {
            const newValue = this.#restrictValue(rValue);
            const oldValue = this.value;
            if (newValue != oldValue) {
                VALUE.set(this, newValue);
                STORAGES.items.set(ref, newValue);
                // external
                const event = new Event("value");
                event.value = newValue;
                this.dispatchEvent(event);
            }
        }
    }

    get value() {
        const value = VALUE.get(this);
        return this.#restrictValue(value);
    }

    isMarked() {
        if (this.props.mark !== false) {
            const mark = parseInt(this.props.mark);
            if (this.value >= this.max || (!isNaN(mark) && this.value >= mark)) {
                return true;
            }
        }
        return false;
    }

}
