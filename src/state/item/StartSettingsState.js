// GameTrackerJS
import OptionsObserver from "../../util/observer/OptionsObserver.js";
import ItemStateManager from "../../statemanager/item/ItemStateManager.js";
import DefaultItemState from "./DefaultItemState.js";

export default class StartSettingsState extends DefaultItemState {

    #startValue;

    constructor(ref, props) {
        super(ref, props);
        /* --- */
        if (props.start_settings) {
            const optionObserver = new OptionsObserver(props.start_settings);
            if (props.start_values) {
                const startValue = props.start_values[optionObserver.value] ?? 0;
                this.#startValue = parseInt(startValue);
            } else {
                const startValue = optionObserver.value ?? 0;
                this.#startValue = parseInt(startValue);
            }
            optionObserver.addEventListener("change", (event) => {
                this.#applyStartValue(parseInt(event.value));
            });
        }
    }

    #applyStartValue(newValue) {
        newValue = parseInt(newValue) || 1;
        const max = this.max;
        if (newValue < 1) {
            newValue = 1;
        }
        if (newValue > max) {
            newValue = max;
        }
        const oldValue = this.#startValue;
        if (newValue != oldValue) {
            this.#startValue = newValue;
            // external
            const event = new Event("startvalue");
            event.value = newValue;
            this.dispatchEvent(event);
            // update value
            const state = this.value;
            if (!!state && state < newValue) {
                super.value = newValue;
            }
        }
    }

    get startvalue() {
        return this.#startValue;
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
