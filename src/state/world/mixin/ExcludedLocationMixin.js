import {createMixin} from "@emcjs/core/mixin/Mixin.js";
import OptionsObserver from "../../../util/observer/OptionsObserver.js";
import FilterObserver from "../../../util/observer/FilterObserver.js";

const showExcludedLocationsObserver = new FilterObserver("show_excluded_locations");

export default createMixin((superclass) => class ExcludedLocationMixin extends superclass {

    #optionObserver = null;

    constructor(ref, props = {}) {
        super(ref, props);

        this.#optionObserver = new OptionsObserver(`excluded_location[${ref}]`);
        this.#optionObserver.addEventListener("change", (event) => {
            const ev = new Event("excluded");
            ev.value = event.value;
            this.dispatchEvent(ev);
        });
        showExcludedLocationsObserver.onChange((event) => {
            if (this.excluded) {
                const ev = new Event("excluded_visibility");
                ev.value = event.value;
                this.dispatchEvent(ev);
            }
        });
    }

    get excluded() {
        return this.#optionObserver?.value ?? false;
    }

    get excludedVisibility() {
        return showExcludedLocationsObserver.value === "true" || !this.excluded;
    }

});
