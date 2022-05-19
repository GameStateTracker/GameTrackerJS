// GameTrackerJS
import OptionsObserver from "../../util/observer/OptionsObserver.js";
import ItemStateManager from "./ItemStateManager.js";
import DefaultItemState from "./DefaultState.js";

const STARTVALUE = new WeakMap();

export default class StartSettingsState extends DefaultItemState {

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        if (props.start_settings) {
            const optionObserver = new OptionsObserver(props.start_settings);
            if (props.start_values) {
                const startValue = props.start_values[optionObserver.value] ?? 0;
                STARTVALUE.set(this, parseInt(startValue));
            } else {
                const startValue = optionObserver.value ?? 0;
                STARTVALUE.set(this, parseInt(startValue));
            }
            optionObserver.addEventListener("change", (event) => {
                this.#applyStartValue(parseInt(event.value));
            });
        }
    }

    #applyStartValue(newValue) {
        const startvalue = STARTVALUE.get(this);
        newValue = parseInt(newValue) || 1;
        const max = this.max;
        if (newValue < 1) {
            newValue = 1;
        }
        if (newValue > max) {
            newValue = max;
        }
        if (newValue != startvalue) {
            STARTVALUE.set(this, newValue);
            // external
            const event = new Event("startvalue");
            event.value = newValue;
            this.dispatchEvent(event);
            // update value
            const state = this.value;
            if (!!state && state < newValue) {
                this.value = newValue;
            }
        }
    }

    get startvalue() {
        return STARTVALUE.get(this);
    }

    set value(value) {
        if (typeof value != "number") {
            value = 0;
        }
        if (!!value && value < this.startvalue) {
            if (super.value > value) {
                value = 0;
            } else {
                value = this.startvalue;
            }
        }
        super.value = value;
    }

    get value() {
        return super.value;
    }

}

ItemStateManager.register("item_startsettings", StartSettingsState);
ItemStateManager.register("progressive_startsettings", StartSettingsState);
