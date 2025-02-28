import DefaultEntranceState from "../../state/world/entrance/DefaultEntranceState.js";
import DefaultExitState from "../../state/world/exit/DefaultExitState.js";
import OptionsObserver from "../observer/OptionsObserver.js";

const mixedEntrancePoolObserver = new OptionsObserver("mixed_entrance_pool");

class EntranceBindingHandler {

    #mixedEntranceRule;

    checkBindable(exit, entrance) {
        if (!(exit instanceof DefaultExitState)) {
            throw new TypeError("exit has to be an instance of DefaultExitState");
        }
        if (!(entrance instanceof DefaultEntranceState)) {
            throw new TypeError("entrance has to be an instance of DefaultEntranceState");
        }

        return this.#checkEntranceActiveAndBindable(exit, entrance) &&
                (this.#checkMixedEntrances(exit, entrance) || exit.props.bindsTo.indexOf(entrance.props.type) >= 0);
    }

    #checkEntranceActiveAndBindable(exit, entrance) {
        return (entrance.active || exit.props.includeInactiveEntrances) && !entrance.props.unbindable;
    }

    #checkMixedEntrances(exit, entrance) {
        return mixedEntrancePoolObserver.value && !!this.#mixedEntranceRule?.(exit, entrance);
    }

    setMixedEntranceRule(fn) {
        if (typeof fn === "function") {
            this.#mixedEntranceRule = fn;
        } else {
            this.#mixedEntranceRule = null;
        }
    }

}

export default new EntranceBindingHandler();
