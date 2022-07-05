
import OptionsObserver from "../observer/OptionsObserver.js";
import ExitStateManager from "../../statemanager/world/exit/ExitStateManager.js";
import Logic from "./Logic.js";

const detachedEntrancesObserver = new OptionsObserver("detached_entrances");

const INSTANCES = new Map();

function checkForBindingCorrections(exit, newValue, oldValue) {
    if (!detachedEntrancesObserver.value) {
        const oldInstance = INSTANCES.get(oldValue);
        if (oldInstance != null) {
            const oldExit = oldInstance.exit;
            if (exit.ref == oldExit.ref) {
                // leave it as is
            } else if (exit.props.isBiDir) {
                if (oldExit.value == exit.ref) {
                    oldExit.value = "";
                }
            }
        }
        const newInstance = INSTANCES.get(newValue);
        if (newInstance != null) {
            const newEntrance = newInstance.exit;
            if (exit.ref == newEntrance.ref) {
                exit.value = "";
            } else if (exit.props.isBiDir) {
                if (newEntrance.value != "") {
                    const otherEntrance = INSTANCES.get(newEntrance.value);
                    if (otherEntrance != null) {
                        otherEntrance.value = "";
                    }
                }
                newEntrance.value = exit.ref;
            }
        }
    }
}

export default class LogicExitAugmentor {

    #exit = null;

    constructor(ref) {
        INSTANCES.set(ref, this);

        /* EXIT */
        this.#exit = ExitStateManager.get(ref);
        this.#exit.addEventListener("visible", () => {
            this.#changeBinding();
        });
        this.#exit.addEventListener("value", (event) => {
            checkForBindingCorrections(this.#exit, event.newValue, event.oldValue);
            this.#changeBinding();
        });
        this.#changeBinding();
    }

    #changeBinding() {
        const changes = [];
        if (this.#exit.visible) {
            LogicExitAugmentor.applyBinding(changes, this.#exit.ref, this.#exit.value);
        } else {
            LogicExitAugmentor.applyBinding(changes, this.#exit.ref, null);
        }
        if (changes.length) {
            Logic.setRedirect(changes, "region[root]");
        }
    }

    get exit() {
        return this.#exit;
    }

    static applyBinding(changes, from, to) {
        const [source, target] = from.split(" -> ");
        const sourceVal = `region[${source}:in]`;
        const targetVal = `region[${target}:out]`;
        if (source && target) {
            if (!to) {
                changes.push({source: `${sourceVal}{child}`, target: `${targetVal}{child}`, reroute: to});
                changes.push({source: `${sourceVal}{adult}`, target: `${targetVal}{adult}`, reroute: to});
            } else {
                const [reroute] = to.split(" -> ");
                const rerouteVal = `region[${reroute}:out]`;
                if (reroute) {
                    changes.push({source: `${sourceVal}{child}`, target: `${targetVal}{child}`, reroute: `${rerouteVal}{child}`});
                    changes.push({source: `${sourceVal}{adult}`, target: `${targetVal}{adult}`, reroute: `${rerouteVal}{adult}`});
                }
            }
        }
    }

}
